# Pagination Implementation

This document describes the pagination implementation for the Online Application Booking System.

## Overview

Pagination has been implemented across all major entities in the system to improve performance and user experience when dealing with large datasets.

## Backend Implementation

### 1. PaginationResponse DTO

A generic pagination response wrapper that includes:

- `content`: Array of items for the current page
- `page`: Current page number (0-based)
- `size`: Number of items per page
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `hasNext`: Whether there is a next page
- `hasPrevious`: Whether there is a previous page

### 2. Updated Services

#### UserService

- `getAllUsersPaginated(int page, int size)`: Get paginated list of users

#### ProviderService

- `getAllProvidersPaginated(int page, int size)`: Get paginated list of providers
- `searchProvidersPaginated(String searchTerm, int page, int size)`: Search providers with pagination
- `searchByServiceNamePaginated(String serviceName, int page, int size)`: Search by service name with pagination
- `searchByCityPaginated(String city, int page, int size)`: Search by city with pagination
- `searchByDescriptionPaginated(String description, int page, int size)`: Search by description with pagination

#### AppointmentService

- `getAllAppointmentsPaginated(int page, int size)`: Get paginated list of appointments
- `getAppointmentByUserPaginated(User user, int page, int size)`: Get user appointments with pagination
- `getAppointmentByProviderPaginated(Provider provider, int page, int size)`: Get provider appointments with pagination
- `getAppointmentsByProviderUsernamePaginated(String username, int page, int size)`: Get appointments by provider username with pagination

### 3. Updated Controllers

#### UserController

- `GET /api/users/paginated?page=0&size=10`: Get paginated users

#### ProviderController

- `GET /api/providers/paginated?page=0&size=10`: Get paginated providers
- `GET /api/providers/search/paginated?q=term&page=0&size=10`: Search providers with pagination
- `GET /api/providers/search/service/paginated?serviceName=name&page=0&size=10`: Search by service name with pagination
- `GET /api/providers/search/city/paginated?city=city&page=0&size=10`: Search by city with pagination
- `GET /api/providers/search/description/paginated?description=desc&page=0&size=10`: Search by description with pagination

#### AppointmentController

- `GET /api/appointments/paginated?page=0&size=10`: Get paginated appointments
- `GET /api/appointments/user/{userId}/paginated?page=0&size=10`: Get user appointments with pagination
- `GET /api/appointments/provider/{providerId}/paginated?page=0&size=10`: Get provider appointments with pagination
- `GET /api/appointments/my-appointments/paginated?page=0&size=10`: Get current provider appointments with pagination

### 4. Updated Repositories

All repositories now extend `JpaRepository` which provides built-in pagination support:

- `Page<T> findAll(Pageable pageable)`
- `Page<T> findByUser(User user, Pageable pageable)`
- `Page<T> findByProvider(Provider provider, Pageable pageable)`
- Custom search methods with pagination support

## Frontend Implementation

### 1. Pagination Component

A reusable `Pagination` component (`frontend/src/components/Pagination.jsx`) that provides:

- Page navigation with Previous/Next buttons
- Page number display with ellipsis for large page counts
- Current page highlighting
- Results count display
- Responsive design

### 2. Updated Pages

#### Providers Page (`frontend/src/pages/Providers.jsx`)

- Uses paginated API endpoints
- Supports search with pagination
- Configurable page size (6, 12, 18, 24 items per page)
- Search by general term, service name, city, or description
- Real-time pagination updates

#### Admin Dashboard (`frontend/src/pages/AdminDashboard.jsx`)

- Separate pagination for users, providers, and appointments
- Individual page size controls
- Real-time data updates
- Comprehensive admin management

### 3. State Management

Each page manages pagination state:

```javascript
const [currentPage, setCurrentPage] = useState(0);
const [pageSize, setPageSize] = useState(10);
const [totalElements, setTotalElements] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [hasNext, setHasNext] = useState(false);
const [hasPrevious, setHasPrevious] = useState(false);
```

## API Response Format

All paginated endpoints return the same structure:

```json
{
  "content": [
    // Array of items for current page
  ],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "hasNext": true,
  "hasPrevious": false
}
```

## Usage Examples

### Backend Usage

```java
// In a service method
Pageable pageable = PageRequest.of(page, size);
Page<User> userPage = userRepository.findAll(pageable);

return new PaginationResponse<>(
    userPage.getContent(),
    userPage.getNumber(),
    userPage.getSize(),
    userPage.getTotalElements()
);
```

### Frontend Usage

```javascript
// Fetch paginated data
const response = await api.get(
  `/api/providers/paginated?page=${currentPage}&size=${pageSize}`
);
const data = response.data;

setProviders(data.content);
setTotalElements(data.totalElements);
setTotalPages(data.totalPages);
setHasNext(data.hasNext);
setHasPrevious(data.hasPrevious);

// Use pagination component
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  hasNext={hasNext}
  hasPrevious={hasPrevious}
  totalElements={totalElements}
  pageSize={pageSize}
/>;
```

## Testing

Run the pagination test script to verify functionality:

```bash
node test_pagination.js
```

This will test all paginated endpoints and verify the response structure.

## Benefits

1. **Performance**: Reduces database load and memory usage
2. **User Experience**: Faster page loads and better navigation
3. **Scalability**: Handles large datasets efficiently
4. **Consistency**: Uniform pagination across all entities
5. **Flexibility**: Configurable page sizes and search options

## Future Enhancements

1. **Sorting**: Add sorting capabilities to paginated endpoints
2. **Filtering**: Advanced filtering options
3. **Caching**: Implement caching for frequently accessed pages
4. **Infinite Scroll**: Alternative to pagination for mobile devices
5. **Export**: Export paginated data to CSV/Excel
