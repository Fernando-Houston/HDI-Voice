# Houston Voice AI - Troubleshooting Guide

## 🔍 Search Query Getting Stuck

### Common Causes & Solutions

#### 1. **Flask API Cold Start (Railway)**
- **Symptom**: First request takes 30+ seconds or times out
- **Solution**: 
  ```javascript
  // Add warmup request on app load
  useEffect(() => {
    HDI_API.testConnection(); // Warms up the API
  }, []);
  ```

#### 2. **Database Query Performance**
- **Symptom**: Searches work but take 10-30 seconds
- **Solutions**:
  - Add database indexes on search fields
  - Implement query result caching
  - Limit search results (e.g., TOP 10)
  - Use full-text search instead of LIKE queries

#### 3. **Request Timeout Issues**
- **Symptom**: "Request timeout" errors after 30 seconds
- **Solution**: Already implemented in HDI-Voice-Enhanced.tsx with:
  - 30-second timeout
  - Automatic retry with exponential backoff
  - Request cancellation on new searches

#### 4. **CORS Issues**
- **Symptom**: Network errors, "CORS policy" messages
- **Solution**: Ensure Flask API has proper CORS headers:
  ```python
  from flask_cors import CORS
  CORS(app, origins=['http://localhost:3000', 'https://your-domain.com'])
  ```

#### 5. **Payload Format Issues**
- **Symptom**: 400/422 errors, "Invalid request" messages
- **Debug**: Check api-utils.js console logs for exact payload being sent

### 🛠️ Debugging Steps

1. **Run API Tests**:
   ```javascript
   // In browser console:
   import('./test-api-endpoints.js').then(m => m.runAllTests())
   ```

2. **Enable Debug Mode**:
   ```javascript
   // In your component:
   import { enableAPIDebugMode } from './api-utils';
   enableAPIDebugMode();
   ```

3. **Check Network Tab**:
   - Open browser DevTools → Network tab
   - Look for requests to `hdi-api-production.up.railway.app`
   - Check response times and error codes

4. **Monitor Console Logs**:
   - Enhanced component logs all API requests/responses
   - Look for patterns in failures

### 📊 Performance Optimization

#### Frontend Optimizations (Already Implemented):
- ✅ Request debouncing
- ✅ Request cancellation
- ✅ Timeout handling
- ✅ Retry logic with backoff
- ✅ Error recovery

#### Backend Optimizations (Flask API):
1. **Add Request Caching**:
   ```python
   from flask_caching import Cache
   cache = Cache(config={'CACHE_TYPE': 'simple'})
   
   @cache.memoize(timeout=300)  # 5 min cache
   def search_properties(query):
       # Your search logic
   ```

2. **Implement Pagination**:
   ```python
   @app.route('/api/v1/properties/voice-search', methods=['POST'])
   def voice_search():
       limit = request.json.get('limit', 10)
       offset = request.json.get('offset', 0)
       # Return limited results
   ```

3. **Add Database Indexes**:
   ```sql
   CREATE INDEX idx_property_address ON properties(address);
   CREATE INDEX idx_property_street ON properties(street_name);
   CREATE FULLTEXT INDEX idx_property_search ON properties(address, street_name);
   ```

4. **Use Connection Pooling**:
   ```python
   from sqlalchemy.pool import QueuePool
   engine = create_engine(
       DATABASE_URL,
       poolclass=QueuePool,
       pool_size=10,
       max_overflow=20
   )
   ```

### 🚨 Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Request timeout - server took too long" | API response > 30s | Optimize backend queries |
| "Failed after 3 attempts" | Persistent API errors | Check Railway logs |
| "Client error 404" | Endpoint not found | Verify API routes |
| "Client error 422" | Invalid request format | Check payload structure |
| "Network error" | Connection issues | Check CORS, API status |

### 🔧 Quick Fixes

1. **Immediate Relief**: Increase timeout
   ```javascript
   // In api-utils.js
   REQUEST_TIMEOUT: 60000, // 60 seconds
   ```

2. **Reduce Load**: Limit search scope
   ```javascript
   // Add to search payload
   body: JSON.stringify({
     spoken_text: spokenText,
     limit: 5,  // Return only top 5 results
     exact_match: true  // Prefer exact matches
   })
   ```

3. **Add Loading Feedback**: Better UX during long searches
   ```javascript
   // Already implemented in enhanced component
   // Shows "Processing..." state
   ```

### 📱 Testing Different Scenarios

Run these test queries to identify patterns:

1. **Simple Address**: "924 Zoe Street"
2. **Complex Query**: "Show me 3 bedroom houses in Katy under 500k"
3. **Area Search**: "Properties in Energy Corridor"
4. **AI Query**: "What's the market trend?"

Document which queries fail and their error messages.

### 🚀 Railway-Specific Issues

1. **Check Railway Logs**:
   ```bash
   railway logs
   ```

2. **Monitor Resource Usage**:
   - CPU/Memory limits
   - Database connection limits
   - Request rate limits

3. **Scale Up if Needed**:
   - Upgrade Railway plan
   - Add more dynos/workers
   - Implement caching layer

### 💡 Prevention

1. **Add Health Checks**:
   ```javascript
   // Periodic API health checks
   setInterval(() => {
     HDI_API.testConnection().catch(console.error);
   }, 60000); // Every minute
   ```

2. **Implement Circuit Breaker**:
   ```javascript
   // Temporarily disable API if too many failures
   if (consecutiveFailures > 5) {
     showMessage("API temporarily unavailable");
     setTimeout(resetCircuit, 30000);
   }
   ```

3. **User Feedback**:
   - Show estimated wait times
   - Provide cancel option
   - Suggest simpler queries

### 📞 Need More Help?

1. Check Railway deployment logs
2. Review Flask API error logs
3. Test with curl/Postman directly
4. Monitor database query performance
5. Check for rate limiting

Remember: The enhanced component already handles most common issues. If searches still get stuck, the problem is likely on the backend (Flask API or database).