using Hassad.Application.Common.Interfaces;

namespace Hassad.Infrastructure.Security;

public sealed class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
            return false;

        // TEMPORARY: very old accounts were saved with plain-text passwords.
        // They are re-hashed at their next login (see AuthService.LoginAsync).
        // When no plain-text passwords are left in the database, delete this branch.
        if (NeedsRehash(storedHash))
            return string.Equals(password, storedHash, StringComparison.Ordinal);

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }

    // BCrypt hashes start with $2a$, $2b$ or $2y$.
    public bool NeedsRehash(string storedHash) =>
        !(storedHash.StartsWith("$2a$") || storedHash.StartsWith("$2b$") || storedHash.StartsWith("$2y$"));
}
