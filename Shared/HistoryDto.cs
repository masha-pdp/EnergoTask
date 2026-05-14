namespace Shared;

public class HistoryDto
{
    public int Id { get; set; }
    public string Text { get; set; } = null!;
    public string UserFullName { get; set; } = null!;
    public DateTime Dt { get; set; }
    public  string EventTypeName { get; set;} = null!;
}
