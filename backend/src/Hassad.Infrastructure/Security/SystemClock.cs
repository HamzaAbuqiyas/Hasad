using Hassad.Application.Common.Interfaces;

namespace Hassad.Infrastructure.Security;

public sealed class SystemClock : IClock
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
