/**
 * 
 * @param {int} resultsPerPage - number of results to return per page
 * @param {int} pageNum - which page number
 * @returns 
 */
const setPaginationData = (resultsPerPage,pageNum)=>{
    return {
        resultsPerPage,
        pageNum:(pageNum >= 2) ? pageNum - 1 : 0
    }
}
/**
 * Returns whether there are more pages to load
 * @param {int} resultsPerPage 
 * @param {int} pageNum - Page number requested in URL
 * @param {int} count 
 * @returns 
 */
const endOfResults = (resultsPerPage,pageNum,count)=>{
    let page = (pageNum <= 1) ? 1 : pageNum;
    const end = (resultsPerPage * page < count) ? true : false;
    return end;
}

export {setPaginationData,endOfResults};