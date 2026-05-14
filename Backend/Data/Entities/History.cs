namespace Backend.Data.Entities;

public class History
{
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public Guid UserId { get; set; }
    public DateTime Dt { get; set; }
    public  int  EventTypeId { get; set;}

    public EventTypeId EventType { get; set; } = null!;
    public User User { get; set; } = null!;
}
