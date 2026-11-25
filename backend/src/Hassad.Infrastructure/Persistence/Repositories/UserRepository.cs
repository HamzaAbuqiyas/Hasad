using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;
using Hassad.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hassad.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    // Emails are saved in lower case and SQL Server compares text case-insensitively by default,
    // so a plain "==" works and can use the unique index on Email (".ToLower()" could not).
    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        _db.Users.AnyAsync(u => u.Email == email, ct);

    public async Task<IReadOnlyList<User>> GetAllNewestFirstAsync(CancellationToken ct = default) =>
        await _db.Users.AsNoTracking().OrderByDescending(u => u.JoinDate).ToListAsync(ct);

    public Task<int> CountAsync(CancellationToken ct = default) => _db.Users.CountAsync(ct);

    public Task<int> CountByRoleAsync(UserRole role, CancellationToken ct = default) =>
        _db.Users.CountAsync(u => u.Role == role, ct);

    public Task<int> CountByStatusAsync(AccountStatus status, CancellationToken ct = default) =>
        _db.Users.CountAsync(u => u.AccountStatus == status, ct);

    public void Add(User user) => _db.Users.Add(user);

    public void Remove(User user) => _db.Users.Remove(user);
}
