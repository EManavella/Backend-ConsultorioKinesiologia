import bcrypt from 'bcrypt';

const saltRounds = 10; // Puedes ajustar esto según tus necesidades

export async function hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    const match = await bcrypt.compare(password, hash);
    return match;
}
