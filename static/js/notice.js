window.onload = () => {
  // 게시글 가져오기
  loadArticles();
  pagination();
};

/**
 * 작성자 : 공민영
 * 내용 : 게시글 가져오기
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
async function getArticles() {
  const response = await fetch(`${backend_base_url}/article/notice/`);

  if (response.status == 200) {
    const response_json = await response.json();
    return response_json;
  } else {
    alert("게시글을 불러오는데 실패했습니다.");
  }
}

/**
 * 작성자 : 공민영
 * 내용 : 토큰 유무 확인
 * 최초 작성일 : 2023.06.30
 */
function isLoggenIn() {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    return true;
  }
  return false;
}

/**
 * 작성자: 공민영
 * 내용: href로 이동하던 게시글작성버튼을 button으로 수정 후 비로그인 사용자가 게시글 작성 버튼 눌렀을 경우 로그인 필요 문구 출력
 * 최초 작성일: 2023.06.20
 */
document.addEventListener("DOMContentLoaded", function () {
  const createBtn = document.getElementById("create_btn");

  createBtn.addEventListener("click", () => {
    if (!isLoggenIn()) {
      alert('게시글 작성을 위해서는 로그인이 필요합니다!');
    } else {
      window.location.href = `${frontend_base_url}/notice_create.html`;
    }


  });
});

//  * 작성자 : 공민영
//  * 내용 : 게시글 작성하기
//  * 최초 작성일 : 2023.06.15
//  * 업데이트 일자 : 2023.06.15
//  */
async function postArticle() {
  const title = document.getElementById("title").value;
  // CKEditor 인스턴스를 가져옵니다.
  var content = CKEDITOR.instances.content.getData();

  // const article_image = document.getElementById("notice_article_image")
  //   .files[0];

  const formdata = new FormData();

  formdata.append("title", title);
  formdata.append("content", content);
  // if (article_image == undefined) {
  //   formdata.append("article_image", "");
  // } else {
  //   formdata.append("article_image", article_image);
  // }

  if (title == "" || content == "") {
    alert("제목,내용은 필수");
  } else {
    const response = await fetch(`${backend_base_url}/article/notice/`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
      body: formdata,
    });
    if (response.status == 201) {
      alert("작성완료!");
      window.location.replace("../notice.html");
    } else if (response.status == 401) {
      alert("토큰이 만료! 재로그인하세요!");
      handleLogout();
    } else {
      alert(response.statusText);
      location.reload();
    }
  }
}

/**
 * 작성자 : 공민영
 * 내용 : 게시글 상세보기 url
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
function articleDetail(articleId) {
  window.location.href = `${frontend_base_url}/notice_detail.html?article_id=${articleId}`;
}

/**
 * 작성자: 공민영
 * 내용: 방법공유 페이지에서 게시글 불러오기
 * 최초 작성일: 2023.06.20
 * 업데이트 일자: 2023.06.20
 */
async function loadArticles() {

  const articles = await getArticles();
  // 비동기 작업이 완료된 후에 실행되는 콜백 함수
  pagination(function (pagination) {

    const articleList = $("#notice_list");

    articles.forEach((article) => {
      const newListCol = $("<div>")
        .addClass("list_col")
        .attr("onclick", `articleDetail(${article.id})`);
      const newList = $("<div>").addClass("list").attr("id", article.id);
      newListCol.append(newList);

      const newListLi = $("<li>").addClass("list_li");
      newListCol.append(newListLi);

      const newListUl = $("<ul>").addClass("list_ul");
      newListLi.append(newListUl);

      const newListId = $("<li>").addClass("list_id").text(article.id);
      newListUl.append(newListId);

      const newListTitle = $("<li>").addClass("list_title").text(article.title);
      newListUl.append(newListTitle);

      const newListUpdated = $("<li>")
        .addClass("list_updated")
        .text(timeago(article.updated_at));
      newListUl.append(newListUpdated);

      const newListNickname = $("<li>")
        .addClass("list_nickname")
        .text(article.user.nickname);
      newListUl.append(newListNickname);

      const newListHits = $("<li>").addClass("hits").text(article.hits);
      newListUl.append(newListHits);

      articleList.append(newListCol);
    });
  });
}

/**
 * 작성자: 공민영
 * 내용: 방법공유 페이지 페이지네이션
 * 최초 작성일: 2023.06.29
 * 수정자: 공민영
 * 업데이트 일자: 2023.06.20
 * 수정내용: callback함수 없다는 에러 안뜨게 수정함
 */
async function pagination(callback) {
  // 작업이 완료되면, 콜백 함수가 존재할 경우에만 해당 코드를 실행
  if (callback) {
    const articles = await callback();
    const rowsPerPage = 10; //한 페이지에 담을 개수
    // const rows = await getArticles();
    const rows = document.querySelectorAll('#ul_table .list_col')
    // const rows = document.querySelectorAll('list_col')
    const rowsCount = rows.length;

    const pageCount = Math.ceil(rowsCount / rowsPerPage);//page 숫자 만들기 위한 계산 변수
    const numbers = document.querySelector('#numbers');

    const prevPageBtn = document.querySelector('.pagination .prev')
    const nextPageBtn = document.querySelector('.pagination .next')
    //현재 보고있는 페이지그룹 번호
    let pageActiveIdx = 0;
    //현재 보고있는 페이지네이션 번호
    let currentRageNum = 0;
    //페이지그룹 최대 개수
    let maxPageNum = 3;


    //페이지 갯수에 따라 numbers에 html 생성
    for (let i = 1; i <= pageCount; i++) {
      numbers.innerHTML += `<li><a href="">${i}</a></li>`;
    };
    const numberBtn = numbers.querySelectorAll('a');

    //페이지네이션 번호 감추기
    for (nb of numberBtn) {
      nb.style.display = 'none';
    }


    //a(item)를 눌렀을때 할일
    //몇번을 클릭했는지 알 수 있어야 함
    numberBtn.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        //숫자를 넘겨주면 그 숫자가 보이게끔
        displayRow(index);
      });
    });

    function displayRow(index) {
      let start = index * rowsPerPage;
      let end = start + rowsPerPage;
      let rowsArray = [...rows];

      for (ra of rowsArray) {
        ra.style.display = 'none';
      }

      let newRows = rowsArray.slice(start, end);
      for (nr of newRows) {
        nr.style.display = "";
      }

      for (nb of numberBtn) {
        nb.classList.remove('active');
      }
      numberBtn[index].classList.add('active');
    }
    displayRow(0);

    /**
     * 작성자: 공민영
     * 내용: 페이지네이션 그룹 표시 함수
     * 최초 작성일: 2023.06.29
     */
    function displayPage(num) {
      //페이지네이션 번호 감추기
      for (nb of numberBtn) {
        nb.style.display = 'none';
      }
      let totalpageCount = Math.ceil(pageCount / maxPageNum);

      let pageArr = [...numberBtn];
      let start = num * maxPageNum;
      let end = num + maxPageNum;
      let pageListArr = pageArr.slice(start, end);

      for (let item of pageListArr) {
        item.style.display = 'block';
      }

      if (pageActiveIdx == 0) {
        prevPageBtn.style.display = 'none';
      } else {
        prevPageBtn.style.display = 'block';
      }

      if (pageActiveIdx == totalpageCount - 1) {
        nextPageBtn.style.display = 'none';
      } else {
        nextPageBtn.style.display = 'block';
      }

    }
    displayPage(0);

    nextPageBtn.addEventListener('click', () => {
      let nextPageNum = pageActiveIdx * maxPageNum + maxPageNum;
      displayRow(nextPageNum)
      ++pageActiveIdx;
      displayPage(pageActiveIdx);
    })

    prevPageBtn.addEventListener('click', () => {
      let nextPageNum = pageActiveIdx * maxPageNum - maxPageNum;
      displayRow(nextPageNum)
      --pageActiveIdx;
      displayPage(pageActiveIdx);
    })
  }
}