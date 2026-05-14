namespace Backend.Data.Entities;

public class User
{
    public  Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = null!;

    public List<History> Histories { get; set; } = new();
}
