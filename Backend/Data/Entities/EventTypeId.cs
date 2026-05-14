using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Data.Entities;

public class EventTypeId
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

class EventTypeIdConfiguration : IEntityTypeConfiguration<EventTypeId>
{
    public void Configure(EntityTypeBuilder<EventTypeId> builder)
    {
        builder
            .Property(e => e.Id)
            .ValueGeneratedNever();

        builder.HasData(
            new EventTypeId { Id = 1, Name = "Редактирование" },
            new EventTypeId { Id = 2, Name = "Добавление записи" },
            new EventTypeId { Id = 3, Name = "Удаление записи" }
        );
    }
}



    