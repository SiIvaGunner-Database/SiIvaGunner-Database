import math
import re

from urllib.parse import urlencode


def convertFormParamsToQueryParams(request, parameterNames):
    """
    Convert all request POST parameters to a string of query parameters with the same names and values.
    E.g. POST data { "param": "value", "param": "value" } becomes "/path/?param=value&param=value".
    """
    parameters = []

    # Check for POST parameters and encode them as strings in the format "param=value"
    for name in parameterNames:
        if request.POST[name] is not None:
            queryMap = { name: request.POST[name] }
            queryString =  urlencode(queryMap)
            parameters.append(queryString)

    paramChar = '?'
    queryParamsString = ''

    # Format the parameters as a string in the format "/path/?param=value&param=value"
    for param in parameters:
        queryParamsString += paramChar + param
        paramChar = '&'

    return queryParamsString


def getPageNumbers(resultCount, currentPage):
    """
    Get a list of numbers and strings equal to either a positive number, "current", or "skip".
    E.g. [1, 2, 3, "skip", 6, 7, "current", 9, 10, "skip", 98, 99, 100]
    """
    pageCounter = resultCount
    pageNumber = 0
    pageNumbers = {}
    lastPage = math.ceil(resultCount / 50)

    # Ensure the current and last page numbers are valid
    if lastPage < 1:
        lastPage = 1
    if currentPage < 1:
        currentPage = 1
    elif currentPage > lastPage:
        currentPage = lastPage

    # List all possible page numbers that might be used
    possiblePageNumbers = [1, 2, 3,
        currentPage - 3, currentPage - 2, currentPage - 1,
        currentPage,
        currentPage + 1, currentPage + 2, currentPage + 3,
        lastPage - 2, lastPage - 1, lastPage,
    ]

    # Loop through the possible page numbers
    for pageNumber in possiblePageNumbers:
        # If the page number is invalid, skip it
        if pageNumber < 1 or pageNumber > lastPage:
            continue
        # If the page is one of the first three pages, last three pages, or within two pages of the current page
        if  (
                pageNumber <= 3 or pageNumber >= lastPage - 2
                or (pageNumber >= currentPage - 2 and pageNumber <= currentPage + 2)
            ):
            if pageNumber == currentPage:
                pageNumbers[pageNumber] = 'current'
            else:
                pageNumbers[pageNumber] = pageNumber
        # Else if the page is three pages from the current page, first page, or last page
        elif(
                pageNumber == currentPage - 3 or pageNumber == currentPage + 3
                or (pageNumber == 4 and currentPage == 1)
                or (pageNumber == lastPage - 3 and currentPage == lastPage)
            ):
            pageNumbers[pageNumber] = 'skip'

    return pageNumbers.values()


def getPathWithoutPageParameter(request):
    """
    Get the full path from the request with "page" and empty query parameters removed.
    The path wiill end with either a question mark or ampersand.
    E.g "/path/?" or "/path/?param=value&param=value&".
    """
    if not request.GET:
        # If there are no parameters, return "/path/?"
        return request.get_full_path() + '?'
    else:
        # Else return "/path/?param=value&param=value&"
        url = request.get_full_path()
        url = re.sub('\?.*', '?', url, flags=re.DOTALL)

        # Add each individual "parameter=value&"
        for name in request.GET:
            if name != 'page':
                value = request.GET[name]
                if value != '':
                    url += name + '=' + value + '&'

        return url
