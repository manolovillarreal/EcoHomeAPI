jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');
const authJWT = require('../../../src/middleware/authJWT');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware authJWT', () => {
  beforeEach(() => {
    jwt.verify.mockReset();
  });

  test('devuelve 401 cuando falta el token bearer', () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    authJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing or invalid authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  test('asigna req.user cuando el access token es valido', () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = createResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({
      id: 'user-1',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      tokenType: 'access'
    });

    authJWT(req, res, next);

    expect(req.user).toEqual({
      id: 'user-1',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@example.com'
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('rechaza refresh tokens usados como bearer tokens', () => {
    const req = { headers: { authorization: 'Bearer refresh-token' } };
    const res = createResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({
      id: 'user-1',
      tokenType: 'refresh'
    });

    authJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 cuando el token es invalido o expiro', () => {
    const req = { headers: { authorization: 'Bearer broken-token' } };
    const res = createResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});
