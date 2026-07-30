import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest'

const mockAxiosPost = vi.fn()

const apiInstance = Object.assign(vi.fn(), {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
})

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiInstance),
    post: mockAxiosPost,
  },
  create: vi.fn(() => apiInstance),
  post: mockAxiosPost,
}))

let reqHandler
let resOkHandler
let resErrHandler
let axiosCreateMock

beforeAll(async () => {
  delete window.location
  window.location = { href: '', pathname: '/' }

  await import('../../api/axios')

  axiosCreateMock = (await import('axios')).default.create
  reqHandler = apiInstance.interceptors.request.use.mock.calls[0]?.[0]
  resOkHandler = apiInstance.interceptors.response.use.mock.calls[0]?.[0]
  resErrHandler = apiInstance.interceptors.response.use.mock.calls[0]?.[1]
})

beforeEach(() => {
  localStorage.clear()
  window.location.href = ''
})

describe('src/api/axios.js', () => {
  it('cria axios com baseURL e withCredentials', () => {
    const callArgs = axiosCreateMock.mock.calls[0][0]
    expect(callArgs.baseURL).toBeTruthy()
    expect(callArgs.withCredentials).toBe(true)
  })

  describe('request interceptor', () => {
    it('adiciona Authorization header quando token existe', () => {
      localStorage.setItem('accessToken', 'test-token')
      const config = { headers: {} }
      const result = reqHandler(config)
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('nao adiciona Authorization quando token ausente', () => {
      const config = { headers: {} }
      const result = reqHandler(config)
      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('response interceptor', () => {
    it('retorna response inalterada em caso de sucesso', () => {
      const response = { data: { ok: true } }
      expect(resOkHandler(response)).toBe(response)
    })

    it('propaga erro se status não é 401', async () => {
      const error = { response: { status: 400 }, config: {} }
      await expect(resErrHandler(error)).rejects.toBe(error)
    })

    it('ignora rota /usuario/login e propaga erro', async () => {
      const error = { response: { status: 401 }, config: { url: '/usuario/login' } }
      await expect(resErrHandler(error)).rejects.toBe(error)
    })

    it('tenta renovar token via refresh', async () => {
      apiInstance.post.mockResolvedValueOnce({ data: { accessToken: 'new-token' } })

      const error = { response: { status: 401 }, config: { url: '/empresa', _retry: false, headers: {} } }
      resErrHandler(error)

      await vi.waitFor(() => {
        expect(apiInstance.post).toHaveBeenCalledWith('/usuario/refresh', {})
      })
    })

    it('redireciona para /login se refresh falha', async () => {
      apiInstance.post.mockRejectedValueOnce(new Error('fail'))
      const error = { response: { status: 401 }, config: { url: '/empresa' } }
      await expect(resErrHandler(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/login')
    })
  })
})
