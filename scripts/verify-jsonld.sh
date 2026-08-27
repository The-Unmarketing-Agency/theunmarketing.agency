#!/bin/bash
# JSON-LD Verification Script
# Run this after deploying fixes to verify JSON-LD is working correctly

echo "🔍 Checking JSON-LD on The Unmarketing Agency website..."
echo "="*50

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ curl is not installed"
    exit 1
fi

# Test 1: Check if site is accessible
echo "1. Testing website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.theunmarketing.agency)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Website is accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Website not accessible (HTTP $HTTP_STATUS)"
    exit 1
fi

# Test 2: Extract JSON-LD @context
echo -e "\n2. Checking JSON-LD @context..."
JSON_CONTEXT=$(curl -s https://www.theunmarketing.agency | grep -o '"@context":"[^"]*"' | head -1)
echo "Found JSON-LD @context: $JSON_CONTEXT"

if [[ "$JSON_CONTEXT" == '"@context":"https://schema.org"' ]]; then
    echo "✅ JSON-LD @context is CORRECT"
elif [[ "$JSON_CONTEXT" == '"@context":"https://***@graph"' ]]; then
    echo "❌ JSON-LD @context is STILL BROKEN - Needs fix!"
    echo "   Current: $JSON_CONTEXT"
    echo "   Should be: \"@context\":\"https://schema.org\""
else
    echo "⚠️  JSON-LD @context is different: $JSON_CONTEXT"
fi

# Test 3: Check JSON-LD script tag exists
echo -e "\n3. Checking JSON-LD script presence..."
SCRIPT_FOUND=$(curl -s https://www.theunmarketing.agency | grep -c 'page-structured-data')
if [ "$SCRIPT_FOUND" -gt 0 ]; then
    echo "✅ JSON-LD script tag found"
else
    echo "❌ JSON-LD script tag not found"
fi

# Test 4: Validate JSON structure (simple check)
echo -e "\n4. Validating JSON structure..."
JSON_CONTENT=$(curl -s https://www.theunmarketing.agency | grep -o 'page-structured-data[^>]*>[^<]*' | head -c 200)
if [[ "$JSON_CONTENT" == *"@context"* && "$JSON_CONTENT" == *"@graph"* ]]; then
    echo "✅ Basic JSON structure appears valid"
else
    echo "⚠️  JSON structure may be malformed"
fi

# Test 5: Google Rich Results Test suggestion
echo -e "\n5. Next steps for verification:"
echo "   a. Test with Google Rich Results:"
echo "      https://search.google.com/test/rich-results"
echo "   b. Validate with Schema Markup Validator:"
echo "      https://validator.schema.org/"
echo "   c. Check Google Search Console for errors"

echo -e "\n="*50
echo "📊 Summary:"
echo "Website Status: HTTP $HTTP_STATUS"
echo "JSON-LD @context: $JSON_CONTEXT"
echo "Script tag found: $SCRIPT_FOUND"
echo -e "\n🚨 If @context shows \"https://***@graph\", fix is needed!"
echo "📚 See docs/JSON-LD-FIX.md for detailed fix instructions"