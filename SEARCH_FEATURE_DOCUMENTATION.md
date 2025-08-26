# Search Feature Documentation

## Overview

The Online Application Booking System now includes a comprehensive search functionality that allows users to find service providers based on various criteria such as service name, city, description, and more.

## Features Implemented

### 🔍 Backend Search API Endpoints

#### 1. General Search

- **Endpoint**: `GET /api/providers/search?q={searchTerm}`
- **Description**: Searches across all provider fields (service name, description, city, state, address, username)
- **Example**: `/api/providers/search?q=haircut`

#### 2. Service Name Search

- **Endpoint**: `GET /api/providers/search/service?serviceName={serviceName}`
- **Description**: Searches specifically by service name
- **Example**: `/api/providers/search/service?serviceName=massage`

#### 3. City Search

- **Endpoint**: `GET /api/providers/search/city?city={city}`
- **Description**: Searches providers by city
- **Example**: `/api/providers/search/city?city=jaffna`

#### 4. Description Search

- **Endpoint**: `GET /api/providers/search/description?description={description}`
- **Description**: Searches providers by description content
- **Example**: `/api/providers/search/description?description=beauty`

### 🎨 Frontend Search Interface

#### Search Components

1. **Search Input Field**: Modern, responsive search bar with placeholder text
2. **Search Type Dropdown**: Allows filtering by specific field types
3. **Search Button**: Triggers the search with loading state
4. **Clear Button**: Resets search and shows all providers
5. **Search Tips**: Helpful suggestions for users

#### Features

- **Real-time Filtering**: Client-side filtering for instant results
- **Server-side Search**: Advanced search using backend API
- **Loading States**: Visual feedback during search operations
- **Error Handling**: Graceful error messages
- **Responsive Design**: Works on all device sizes

## Technical Implementation

### Backend Changes

#### 1. ProviderRepository.java

```java
// Added search methods
List<Provider> findByServiceNameContainingIgnoreCase(String serviceName);
List<Provider> findByDescriptionContainingIgnoreCase(String description);
List<Provider> findByCityContainingIgnoreCase(String city);
List<Provider> findByStateContainingIgnoreCase(String state);
List<Provider> findByAddressContainingIgnoreCase(String address);

// Comprehensive search query
@Query("SELECT DISTINCT p FROM Provider p WHERE " +
       "LOWER(p.serviceName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(p.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(p.state) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(p.address) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
       "LOWER(p.user.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
List<Provider> searchProviders(@Param("searchTerm") String searchTerm);
```

#### 2. ProviderService.java

```java
// Added search method signatures
List<Provider> searchProviders(String searchTerm);
List<Provider> searchByServiceName(String serviceName);
List<Provider> searchByCity(String city);
List<Provider> searchByDescription(String description);
```

#### 3. ProviderServiceImpl.java

- Implemented all search methods with proper error handling
- Added availability loading for search results
- Case-insensitive search functionality

#### 4. ProviderController.java

- Added REST endpoints for all search types
- Proper request parameter handling
- Consistent response format

### Frontend Changes

#### Providers.jsx

- Added search state management
- Implemented both client-side and server-side search
- Added modern UI components with Tailwind CSS
- Responsive design for mobile and desktop

## Usage Examples

### Search by Service Type

```
Search Term: "haircut"
Result: All providers offering haircut services
```

### Search by Location

```
Search Term: "jaffna"
Result: All providers located in Jaffna
```

### Search by Description

```
Search Term: "beauty"
Result: All providers with "beauty" in their description
```

## Search Tips for Users

The interface includes helpful search suggestions:

- **haircut** - Find hair styling services
- **jaffna** - Find providers in Jaffna
- **massage** - Find massage therapy services
- **beauty** - Find beauty and wellness services
- **colombo** - Find providers in Colombo

## Testing

### Manual Testing

1. Start the backend server: `cd backend && ./mvnw spring-boot:run`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to the Providers page
4. Test search functionality with various terms

### Automated Testing

Run the test script: `node test_search_functionality.js`

## API Response Format

All search endpoints return the same format:

```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "provider1"
    },
    "serviceName": "Hair Styling",
    "description": "Professional haircut and styling services",
    "city": "Jaffna",
    "state": "Northern Province",
    "servicePricing": "Rs. 500-1000",
    "availabilities": [...]
  }
]
```

## Performance Considerations

1. **Case-insensitive Search**: All searches are case-insensitive for better user experience
2. **Partial Matching**: Uses LIKE queries with wildcards for flexible matching
3. **Eager Loading**: Loads availability data for search results
4. **Client-side Filtering**: Provides instant feedback for better UX

## Future Enhancements

1. **Advanced Filters**: Add filters for pricing, availability, ratings
2. **Search History**: Remember user's recent searches
3. **Autocomplete**: Suggest search terms as user types
4. **Search Analytics**: Track popular search terms
5. **Geolocation Search**: Find providers near user's location

## Troubleshooting

### Common Issues

1. **No Results**: Check if search term matches provider data
2. **Connection Error**: Ensure backend server is running
3. **Case Sensitivity**: Search is case-insensitive, so "Haircut" and "haircut" work the same

### Debug Steps

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Test with simple search terms first
4. Check database for provider data

## Conclusion

The search feature provides a powerful and user-friendly way to discover service providers. It combines both client-side and server-side search capabilities for optimal performance and user experience.
