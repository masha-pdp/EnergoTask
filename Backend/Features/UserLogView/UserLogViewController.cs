using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Data.Entities;
using Shared;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.UserLogView;

[ApiController]
[Route("api/[controller]")]
public class UserLogViewController : Controller 
{
// 1. принять HistoryQueryDto
// 2. взять данные из БД через AppDbContext
// 3. применить фильтры
// 4. применить сортировку
// 5. посчитать totalItems / totalPages
// 6. применить Skip / Take
// 7. вернуть PagedResultDto<HistoryDto>

    private readonly AppDbContext _db;

    public UserLogViewController(AppDbContext db)
    {
        _db = db;
    }

    private IQueryable<History> ApplyFilters(IQueryable<History> queryDb, HistoryQueryDto query)
    {
    if (!string.IsNullOrWhiteSpace(query.Text))
        queryDb = queryDb.Where(h => h.Text.Contains(query.Text));

    if (!string.IsNullOrWhiteSpace(query.UserFullName))
        queryDb = queryDb.Where(h => h.User.FullName.Contains(query.UserFullName));

    if (query.EventTypeId.HasValue)
        queryDb = queryDb.Where(h => h.EventTypeId == query.EventTypeId.Value);

    if (query.DateFrom.HasValue)
        queryDb = queryDb.Where(h => h.Dt >= query.DateFrom.Value);

    if (query.DateTo.HasValue)
        queryDb = queryDb.Where(h => h.Dt <= query.DateTo.Value);

    return queryDb;
}

    private IQueryable<History> ApplySorting(IQueryable<History> queryDb, HistoryQueryDto query)
    {
        return query.SortBy?.ToLower() switch
        {
            "id" => query.SortDirection == "desc"
                ? queryDb.OrderByDescending(h => h.Id)
                : queryDb.OrderBy(h => h.Id),

            "text" => query.SortDirection == "desc"
                ? queryDb.OrderByDescending(h => h.Text)
                : queryDb.OrderBy(h => h.Text),

            "userfullname" => query.SortDirection == "desc"
                ? queryDb.OrderByDescending(h => h.User.FullName)
                : queryDb.OrderBy(h => h.User.FullName),

            "dt" => query.SortDirection == "desc"
                ? queryDb.OrderByDescending(h => h.Dt)
                : queryDb.OrderBy(h => h.Dt),

            "eventtypename" => query.SortDirection == "desc"
                ? queryDb.OrderByDescending(h => h.EventType.Name)
                : queryDb.OrderBy(h => h.EventType.Name),

            _ => queryDb.OrderByDescending(h => h.Dt)
        };
    }

    //  pages:
    //  1   2   3
    //  records:
    //  1 2 3 4 5 6 7 8 9 10
    //          |..|
    //  |  skip    |
    //              [take]
    //  pageSize = 2
    //  page = 3 (from 0)
    //
    //  skip = pageSize * (page - 1)
    //  take = pageSize

    [HttpGet]
    public async Task<ActionResult<PagedResultDtoResponse<HistoryDto>>> Get([FromQuery] HistoryQueryDto query)
    {
        var queryDb = _db.Histories
            .Include(h => h.User)
            .Include(h => h.EventType)
            .AsQueryable();

        queryDb = ApplyFilters(queryDb, query);
        queryDb = ApplySorting(queryDb, query);

        var totalItems = await queryDb.CountAsync();

        var items = await queryDb
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(h => new HistoryDto
            {
                Id = h.Id,
                Text = h.Text,
                UserFullName = h.User.FullName,
                Dt = h.Dt,
                EventTypeName = h.EventType.Name
            })
            .ToListAsync();

        var result = new PagedResultDtoResponse<HistoryDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)query.PageSize)
        };

        return Ok(result);
    }
}