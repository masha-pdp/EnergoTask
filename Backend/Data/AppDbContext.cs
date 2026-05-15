using Backend.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public DbSet<History> Histories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<EventTypeId> EventTypes { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    /// <summary>
    /// 10 тестовых пользователей и 100 записей журнала с псевдослучайным распределением (фиксированный seed).
    /// </summary>
    public static void SeedTestUsersAndHistory(AppDbContext context)
    {
        var firstTestUserId = Guid.Parse("f0000000-0000-4000-8000-000000000001");
        if (context.Users.Any(u => u.Id == firstTestUserId))
            return;

        var userIds = new Guid[10];
        for (var i = 0; i < 10; i++)
            userIds[i] = Guid.Parse($"f0000000-0000-4000-8000-{(i + 1):x12}");

        var users = new User[10];
        for (var i = 0; i < 10; i++)
        {
            users[i] = new User
            {
                Id = userIds[i],
                FullName = $"Тестовый пользователь {i + 1}"
            };
        }

        context.Users.AddRange(users);

        var rnd = new Random(20260515);
        var sampleTexts = new[]
        {
            "изменены параметры объекта",
            "добавлена новая запись",
            "удалена устаревшая запись",
            "проведена сверка данных",
            "экспорт в отчёт",
            "импорт из файла",
            "назначен ответственный",
            "снято с контроля",
            "отправлено на согласование",
            "возврат на доработку"
        };

        var baseUtc = new DateTime(2025, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var histories = new History[100];
        for (var n = 0; n < 100; n++)
        {
            histories[n] = new History
            {
                Id = n + 1,
                UserId = userIds[rnd.Next(userIds.Length)],
                EventTypeId = rnd.Next(1, 4),
                Text = $"Событие #{n + 1}: {sampleTexts[rnd.Next(sampleTexts.Length)]}",
                Dt = baseUtc.AddHours(rnd.Next(0, 24 * 180))
            };
        }

        context.Histories.AddRange(histories);
        context.SaveChanges();

        context.Database.ExecuteSqlRaw(
            """SELECT setval(pg_get_serial_sequence('"Histories"', 'Id'), (SELECT MAX("Id") FROM "Histories"));""");
    }
}
