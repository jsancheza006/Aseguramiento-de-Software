import { api } from './api'

/**
 * authService para llamadas de autenticacion
 */
export const authService = {

  /**
   * crear cuenta nueva
   */
  register: (payload) =>
    api.post('/api/auth/register', payload),

  /**
   * iniciar sesion
   */
  login: (payload) =>
    api.post('/api/auth/login', payload),

  /**
   * login con google o github
   */
  oauth: (firebaseUser) =>
    api.post('/api/auth/oauth', firebaseUser),

  /**
   * obtener usuario actual
   */
  me: () =>
    api.get('/api/auth/me'),
}