using Hassad.Application.Common.Interfaces;
using Hassad.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hassad.Infrastructure.Persistence;

/// <summary>
/// EF Core database context. Same tables and columns as the old project,
/// so it works with the existing database and its migrations.
/// </summary>
public class AppDbContext : DbContext, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Prediction> Predictions => Set<Prediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Loads every IEntityTypeConfiguration in this project (see Configurations folder).
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
