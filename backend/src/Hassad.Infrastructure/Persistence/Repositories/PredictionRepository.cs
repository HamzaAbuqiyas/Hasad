using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hassad.Infrastructure.Persistence.Repositories;

public sealed class PredictionRepository : IPredictionRepository
{
    private readonly AppDbContext _db;

    public PredictionRepository(AppDbContext db) => _db = db;

    public Task<Prediction?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.Predictions.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Prediction>> GetForUserNewestFirstAsync(int userId, int? take = null, CancellationToken ct = default)
    {
        var query = _db.Predictions.AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .AsQueryable();

        if (take is > 0)
            query = query.Take(take.Value);

        return await query.ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Prediction>> GetAllWithUserNewestFirstAsync(CancellationToken ct = default) =>
        await _db.Predictions.AsNoTracking()
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public Task<int> CountAsync(CancellationToken ct = default) => _db.Predictions.CountAsync(ct);

    public void Add(Prediction prediction) => _db.Predictions.Add(prediction);

    public void Remove(Prediction prediction) => _db.Predictions.Remove(prediction);
}
