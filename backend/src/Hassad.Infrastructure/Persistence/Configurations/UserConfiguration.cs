using Hassad.Domain.Entities;
using Hassad.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hassad.Infrastructure.Persistence.Configurations;

/// <summary>How a User is stored. Database details stay here, not in the Domain class.</summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("Users");
        b.HasIndex(u => u.Email).IsUnique();

        // Enums are saved as text ("Admin", "Blocked"), exactly like the existing rows.
        b.Property(u => u.Role).HasConversion<string>().HasDefaultValue(UserRole.User);
        b.Property(u => u.AccountStatus).HasConversion<string>().HasDefaultValue(AccountStatus.Active);

        // Computed in C#, not columns.
        b.Ignore(u => u.FullName);
        b.Ignore(u => u.IsAdmin);
        b.Ignore(u => u.IsBlocked);
        b.Ignore(u => u.CropList);
        b.Ignore(u => u.HasCompleteProfile);
    }
}
