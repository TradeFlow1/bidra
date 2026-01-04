import { prisma } from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth'; // You should have a token generator here
import { sendResetEmail } from '@/lib/email'; // This is your send email function

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate the reset token
    const resetToken = generateResetToken();

    // Store the token in the database
    await prisma.user.update({
      where: { email },
      data: { resetToken },
    });

    // Send the email with the reset token
    await sendResetEmail(email, resetToken);

    return res.status(200).json({ message: 'Password reset email sent' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
