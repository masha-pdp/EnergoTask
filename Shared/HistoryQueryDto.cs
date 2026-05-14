namespace Shared;

public class HistoryQueryDto
{
    ///серверная постраничная навигация, выводиться общее количество страниц, 
    /// каждый столбец должен иметь фильтр (фильтрация на сервере), 
    /// серверная сортировка по одному или нескольким столбцам. 
    
    public int Page { get; set; }
    public int PageSize { get; set; }  
    
    // фильтры по столбцам
    public int? Id { get; set; }
    public string? Text { get; set; }
    public string? UserFullName { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int? EventTypeId { get; set; }

    // сортировка
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }

}
