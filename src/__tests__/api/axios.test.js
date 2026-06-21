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
  window.location = { href: '' }

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
  it('cria axios com baseURL correta', () => {
    expect(axiosCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://api-coordenadas-w03m.onrender.com' })
    )
  })

  describe('request interceptor', () => {
    it('adiciona token Bearer quando existe no localStorage', () => {
      localStorage.setItem('accessToken', 'my-token')
      const config = { headers: {} }
      const result = reqHandler(config)
      expect(result.headers.Authorization).toBe('Bearer my-token')
    })

    it('não adiciona Authorization se não há token', () => {
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

    it('tenta renovar token se refreshToken existe', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: { accessToken: 'new-token' } })
      localStorage.setItem('refreshToken', 'my-refresh')

      const error = { response: { status: 401 }, config: { url: '/empresa', _retry: false, headers: {} } }
      resErrHandler(error)

      await vi.waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith('/usuario/refresh', {
          refreshToken: 'my-refresh',
        })
      })
    })

    it('redireciona para /login se não há refreshToken', async () => {
      const error = { response: { status: 401 }, config: { url: '/empresa' } }
      await expect(resErrHandler(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/login')
      expect(localStorage.getItem('accessToken')).toBeNull()
    })
  })
})
