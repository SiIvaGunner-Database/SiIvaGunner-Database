import math

def convertFormParamsToQueryParams(request, parameterNames):
    parameters = []

    # Check for search parameters
    for name in parameterNames:
        if request.POST[name] is not None:
            queryMap = { 'name': request.POST[name] }
            queryString =  urlencode(queryMap) # param=val
            parameters.append(queryString)

    paramChar = '?'
    queryParamsString = ''

    # Format the parameters for a URL
    for param in parameters:
        queryParamsString += paramChar + param # /path/?param=val&param=val
        paramChar = '&'

    return queryParamsString


def getOrderedFilteredObjects():
    return []


def getPageNumbers(resultCount, currentPage):
    pageCounter = resultCount
    pageNumber = 0
    pageNumbers = []
    lastPage = math.ceil(resultCount / 100)

    if lastPage < 1:
        lastPage = 1

    if currentPage > lastPage:
        currentPage = lastPage

    while pageCounter >= 0:
        pageCounter -= 100
        pageNumber += 1

        if  (
                pageNumber <= 3 or pageNumber >= lastPage - 2
                or (pageNumber >= currentPage - 2 and pageNumber <= currentPage + 2)
            ):
            if pageNumber == currentPage:
                pageNumbers.append('current')
            else:
                pageNumbers.append(pageNumber)
        elif(
                pageNumber == currentPage - 3 or pageNumber == currentPage + 3
                or (pageNumber == 4 and currentPage == 1)
                or (pageNumber == lastPage - 3 and currentPage == lastPage)
            ):
            pageNumbers.append('skip')

    return pageNumbers
