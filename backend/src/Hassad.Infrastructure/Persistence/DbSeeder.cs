using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;
using Hassad.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Hassad.Infrastructure.Persistence;

public static class DbSeeder
{
    /// <summary>
    /// Creates the first admin account if it does not exist yet.
    /// Reads AdminSeed:Email and AdminSeed:Password from configuration (user-secrets).
    /// There is no default password any more: if they are not set, nothing is created.
    /// </summary>
    public static async Task SeedAdminAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var clock = scope.ServiceProvider.GetRequiredService<IClock>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        var email = config["AdminSeed:Email"];
        var password = config["AdminSeed:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogInformation("AdminSeed is not configured; skipping admin seeding.");
            return;
        }

        email = User.NormalizeEmail(email);
        if (await db.Users.AnyAsync(u => u.Email == email))
            return;

        var admin = User.Register(config["AdminSeed:FirstName"] ?? "Hassad", config["AdminSeed:LastName"] ?? "Admin",
            email, hasher.Hash(password), clock.Now);
        admin.Role = UserRole.Admin;
        admin.IsProfileCompleted = true;

        db.Users.Add(admin);
        await db.SaveChangesAsync();
        logger.LogInformation("Admin account {Email} created.", email);
    }
}
