const authorize = require('../../../src/middleware/authorizeRole');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware authorize', () => {
  test('devuelve 401 cuando falta req.user', () => {
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    authorize(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 403 cuando el rol del usuario no esta permitido', () => {
    const req = { user: { role: 'client' } };
    const res = createResponse();
    const next = jest.fn();

    authorize(['admin', 'staff'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama a next cuando el rol del usuario esta permitido', () => {
    const req = { user: { role: 'staff' } };
    const res = createResponse();
    const next = jest.fn();

    authorize(['admin', 'staff'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
