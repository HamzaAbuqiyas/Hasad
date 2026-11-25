using Hassad.Domain.Entities;
using Hassad.Domain.Enums;

namespace Hassad.Application.Common.Interfaces;

// The Application layer says WHAT data it needs.
// Infrastructure decides HOW (EF Core + SQL Server). Swapping the database later = new implementation only.

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> GetAllNewestFirstAsync(CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<int> CountByRoleAsync(UserRole role, CancellationToken ct = default);
    Task<int> CountByStatusAsync(AccountStatus status, CancellationToken ct = default);
    void Add(User user);
    void Remove(User user);
}

public interface IPredictionRepository
{
    Task<Prediction?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Prediction>> GetForUserNewestFirstAsync(int userId, int? take = null, CancellationToken ct = default);
    Task<IReadOnlyList<Prediction>> GetAllWithUserNewestFirstAsync(CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    void Add(Prediction prediction);
    void Remove(Prediction prediction);
}

/// <summary>Saves all changes made through the repositories in one go (one transaction).</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
