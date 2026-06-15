import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'slns_super_secret_jwt_key_2026_change_me_in_production';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: Request): { username: string } | null {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...rest] = c.trim().split('=');
        return [key, rest.join('=')];
      })
    );
    const token = cookies['slns_admin_token'];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) return decoded;
    }

    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7);
      const decoded = verifyToken(headerToken);
      if (decoded) return decoded;
    }

    return null;
  } catch {
    return null;
  }
}
