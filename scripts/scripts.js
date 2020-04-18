const showTableOfContents = (function() {
    const API_END_POINT = 'http://localhost:3000/';
    const fetchTableOfContents = function(bookId) {
        const getBookDataAPI = `${API_END_POINT}api/book/${bookId}`;
        return fetch(getBookDataAPI)
          .then((response) => {
            return response.json();
          })
          .then((responseData) => {
            return responseData;
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
    }
    const fetchChapterDetails = (bookId, sectionId) => {
        const getChapterDataAPI = `${API_END_POINT}api/book/${bookId}/section/${sectionId}`;
        return fetch(getChapterDataAPI)
          .then((response) => {
            return response.json();
          })
          .then((responseData) => {
            return responseData;
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
    }
    const sortArraysByNumber = (tempArray) => {
        const sortedArray = tempArray.sort((chapter1Obj, chapter2Obj) => {
            return chapter1Obj.sequenceNO - chapter2Obj.sequenceNO;
        });
        return sortedArray;
    }
    const getProgress = (completedCount, childrenCount) => {
        return Math.round((completedCount/childrenCount) * 100);
    }
    const generateTocHTML = (tocArray) =>{
        let tocHTML = '';
        tocArray.forEach((tocObj, index) => {
            let tempHTML = '<div class="toc-wrapper">';
            tempHTML += `<div class="toc-wrapper--header flex-justify-space-between display-flex flex-align-center ${(tocObj.childrenCount === 0) ? 'disable' : ''}" id='toc-wrapper--header--${tocObj.id}' onclick='fetchChapters(${tocObj.id}, ${index+1})'>`;
            tempHTML += '<svg height="14" width="14" stroke-width="2" stroke="#1D1D1D"><path transform="translate(5,1)" d="M0 0 L6 6 L0 12 L6 6 Z"></path></svg>';
            tempHTML += '<div class="toc-title">';
            tempHTML += `<span class="toc-count display-inline-block">${index + 1}.</span><span>${tocObj.title}</span>`;
            tempHTML += '</div>';
            tempHTML += '<div class="completion-progress display-flex flex-align-center">';
            tempHTML += `<div class="complete-status">${(tocObj.completeCount) ? tocObj.completeCount : 0} / ${tocObj.childrenCount}</div>`;
            tempHTML += `<div class="c100 p${getProgress(tocObj.completeCount, tocObj.childrenCount)} small"> <span>${getProgress(tocObj.completeCount, tocObj.childrenCount)}%</span> <div class="slice"> <div class="bar"></div> <div class="fill"></div></div></div>`
            tempHTML += '</div>';
            tempHTML += '</div>';
            tempHTML += `<div class="toc-wrapper--content" id="toc-wrapper--content--${tocObj.id}">`;
            tempHTML += '</div>';
            tempHTML += '</div>';
            tocHTML += tempHTML;
        });
        return tocHTML;
    }
    const generateChaptersHTML = (chaptersArray, serialNo) => {
        let chapterHTML = '<ul>';
        chaptersArray.forEach((chapterObj, index) => {
            let eachChapterHTML = '<li class="display-flex flex-align-center">';
            eachChapterHTML += `<div class="completion-icon ${(chapterObj.status === 'COMPLETE') ? 'active' : ''}">`;
            eachChapterHTML += '<svg width="35" height="26"><circle cx="12" cy="12" r="12" stroke="white" stroke-width="2" fill="white"></circle><circle cx="12" cy="12" r="9" stroke="#273238" stroke-width="2" fill="white" class="fill-circle"></circle><g></g></svg>';
            eachChapterHTML += '</div>';
            eachChapterHTML += '<div class="chapter-name">';
            eachChapterHTML += `${serialNo}.${index+1}&nbsp; ${chapterObj.title}`;
            eachChapterHTML += '</div>';
            eachChapterHTML += '</li>';
            chapterHTML += eachChapterHTML;
        });
        chapterHTML += '</ul>';
        return chapterHTML;
    }
    const resetToDefaultHTML = () => {
        document.querySelectorAll('.toc-wrapper--header').forEach(eachNode => {
            eachNode.classList.remove('active');
        });
        document.querySelectorAll('.toc-wrapper--content').forEach(eachNode => {
            if (eachNode.style.maxHeight) {
                eachNode.style.maxHeight = null;
            }
        });
    }
    const showLoader = (showHideFlag) => {
        if (showHideFlag) {
            document.querySelector('.loader_js').classList.add('active');
        } else {
            document.querySelector('.loader_js').classList.remove('active');
        }
    }
    return {
        fetchTableOfContents,
        fetchChapterDetails,
        sortArraysByNumber,
        generateTocHTML,
        generateChaptersHTML,
        resetToDefaultHTML,
        showLoader,
    }
})();
// render the topics of the subject
showTableOfContents.showLoader(true);
showTableOfContents.fetchTableOfContents('maths')
    .then((response) => {
        return showTableOfContents.sortArraysByNumber(response.response);
    })
    .then((response) => {
        return showTableOfContents.generateTocHTML(response);
    })
    .then((responseHTML) => {
        // inject the html into the toc contents wrapper
        document.querySelector('.tocs-container').innerHTML = responseHTML;
    })
    .catch((error) => {
        return error;
    })
    .finally(() => {
        showTableOfContents.showLoader(false);
    });
// function to show the individual chapters wrt topic
function fetchChapters(id, serialNo) {
    if (document.querySelector(`#toc-wrapper--header--${id}`).classList.contains('active')) {
        showTableOfContents.resetToDefaultHTML();
    } else {
        showTableOfContents.showLoader(true);
        showTableOfContents.fetchChapterDetails('maths', id)
            .then((response) => {
                return showTableOfContents.sortArraysByNumber(response.response[id]);
            })
            .then((responseData) => {
                return showTableOfContents.generateChaptersHTML(responseData, serialNo);
            })
            .then((chapterHTML) => {
                showTableOfContents.resetToDefaultHTML();
                document.querySelector(`#toc-wrapper--content--${id}`).innerHTML = chapterHTML;
                document.querySelector(`#toc-wrapper--content--${id}`).style.maxHeight = (document.querySelector(`#toc-wrapper--content--${id}`).scrollHeight + 100) + 'px';
                document.querySelector(`#toc-wrapper--header--${id}`).classList.add('active');
            })
            .catch((error) => {
                return error;
            })
            .finally(() => {
                showTableOfContents.showLoader(false);
            });
    }
}