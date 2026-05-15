# EnergoTask — журнал действий пользователя

Веб-приложение для просмотра журнала действий пользователей: таблица с фильтрами, сортировкой и постраничной навигацией.

**Стек:** Angular 21 (frontend), ASP.NET Core 9 (backend), PostgreSQL, Entity Framework Core.

## Функциональность (с точки зрения пользователя)

Приложение состоит из одного экрана — **«Журнал действий пользователя»**.

### Таблица записей

| Колонка | Описание |
|--------|----------|
| Id | Номер записи |
| Текст | Описание действия |
| ФИО пользователя | Кто выполнил действие |
| Дата | Дата и время события |
| Тип события | Редактирование / Добавление записи / Удаление записи |

Режим **только просмотр** — создавать, редактировать и удалять записи через интерфейс нельзя.

### Фильтрация

Под заголовками таблицы доступны фильтры:

- по **Id**;
- поиск по **тексту** и **ФИО** (с задержкой ~300 мс);
- диапазон **дат** («с» — «по»);
- **тип события** (выпадающий список или «Все типы»).

При пустом результате — сообщение и кнопка **«Сбросить фильтры»**.

### Сортировка

Клик по заголовку колонки сортирует данные; повторный клик меняет направление (↑ / ↓). По умолчанию — по дате, новые записи сверху.

### Пагинация

- кнопки **«Назад»** / **«Вперёд»**;
- размер страницы: **10**, **20** или **50** записей;
- отображение «Страница X из Y» и «Всего записей: N».

### Прочее

- изменение **ширины столбцов** перетаскиванием разделителя;
- индикатор загрузки при первом запросе и при обновлении данных.

### Не реализовано

- аутентификация и разграничение прав;
- другие страницы и разделы;
- создание и изменение записей журнала через UI.

## Структура репозитория

```
EnergoTask/
├── Backend/          # ASP.NET Core API, EF Core, миграции
├── frontend/         # Angular SPA
├── Shared/           # общие DTO (HistoryDto, HistoryQueryDto, …)
└── EnergoTask.sln
```

## Требования

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (для Angular CLI)
- PostgreSQL

## Запуск

### 1. База данных

Настройте строку подключения в `Backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=EnergoTaskDb;Username=postgres;Password=..."
}
```

Примените миграции:

```bash
cd Backend
dotnet ef database update
```

В БД автоматически создаются типы событий: *Редактирование*, *Добавление записи*, *Удаление записи*.

#### Тестовые данные (опционально)

Чтобы заполнить БД 10 пользователями и 100 записями журнала, раскомментируйте блок в `Backend/Program.cs`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    AppDbContext.SeedTestUsersAndHistory(db);
}
```

Повторный запуск не дублирует данные (проверка по id первого тестового пользователя).

### 2. Backend

```bash
cd Backend
dotnet run
```

API: `http://localhost:5016`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Приложение откроется на `http://localhost:4200` (порт по умолчанию Angular).

Фронтенд обращается к API по адресу `http://localhost:5016/api/UserLogView` (см. `user-log-view.service.ts`).

## API

**GET** `/api/UserLogView`

Query-параметры:

| Параметр | Описание |
|----------|----------|
| `page`, `pageSize` | Постраничная навигация |
| `id` | Точный фильтр по Id |
| `text` | Подстрока в тексте записи |
| `userFullName` | Подстрока в ФИО пользователя |
| `dateFrom`, `dateTo` | Диапазон дат |
| `eventTypeId` | Id типа события (1–3) |
| `sortBy` | `id`, `text`, `userfullname`, `dt`, `eventtypename` |
| `sortDirection` | `asc` или `desc` |

Ответ — объект с полями `items`, `page`, `pageSize`, `totalItems`, `totalPages`.

Пример:

```
GET http://localhost:5016/api/UserLogView?page=1&pageSize=10&sortBy=dt&sortDirection=desc
```
