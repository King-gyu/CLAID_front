window.onload = () => {
  getArticleDetail();
  setButtonVisibility();
  getComments();
  ArticleGood();
  ArticleGood2();
  getArticleGoodView();
  GoodUser();
  GoodToggle();
};

/**
 * 작성자 : 공민영
 * 내용 : 게시글 상세보기
 * 최초 작성일 : 2023.06.15
 * 최종 수정자 : 이준영
 * 수정 내용 : 너무 많은 코드를 JQuery로 간단히 변경, DB 오디오 연결
 * 일부 playload함수로 이동, nickname 오류 수정
 * 작성시간, 업데이트시간을 상대적이게 표현
 * 업데이트 일자 : 2023.06.17
 */
async function getArticleDetail() {
  const response = await getArticle(getArticleIdFromUrl());

  $("#notice_detail_title").text(response.title);
  $("#notice_detail_content").html(response.content);
  $("#nickname").text(response.user.nickname);
  $("#hits").text(response.hits);
  $("#detail_created_at").text(timeago(response.created_at));
  $("#detail_updated_at").text(timeago(response.updated_at));

  const articleImage = $("#notice_detail_image");
  // const newImage = $("<img>").attr("src", response.article_image ? `${backend_base_url}${response.article_image}` : "../static/img/default.png").addClass("notice_img_size");
  // articleImage.empty().append(newImage);
  articleImage.empty();
}

/**
 * 작성자 : 공민영
 * 내용 : 디테일뷰 가져오기
 * 최초 작성일 : 2023.06.15
 * 수정자 : 이준영
 * 업데이트 내용 : 한글 알람으로 변경
 * 업데이트 일자 : 2023.06.18
 */
async function getArticle(articleId) {
  const response = await fetch(
    `${backend_base_url}/article/notice/${articleId}/`
  );
  if (response.status == 200) {
    response_json = await response.json();
    return response_json;
  } else {
    alert("잘못된 요청입니다.");
  }
}

/**
 * 작성자 : 공민영
 * 내용 : 게시글 아이디 가져오기
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("article_id");
}

/**
 * 작성자: 공민영
 * 내용: 게시글 수정 폼으로 변경
 * 최초 작성일: 2023.06.15
 * 수정자: 이준영 > 공민영
 * 수정 내용: (이준영)수정 기능이 작동되지 않고 세부적인 것을 create를 따르도록
 *  수정 내용: (공민영)수정 버튼 눌렀을 때 삭제버튼이 취소버튼으로 변경
 * 업데이트 일자: 2023.06.18
 */
function putArticle() {
  $(".comment_control_box").hide();
  const elements = {
    title: $("#notice_detail_title"),
    content: $("#notice_detail_content"),
    image: $("#notice_detail_image"),
  };

  const { title, content, image } = elements;

  title.html(
    `<br>
        <input type="text" id="edit_notice_title" maxlength="30" placeholder="title(30자 이내)" value="${title.text()}">`
  );

  content.html(
    `<br>
        <div class="ck_content" id="edit_notice_content">
        <script>CKEDITOR.replace('edit_notice_content')</script>
        ${content.html()}
        </div>`
  );

  // const imagePreview = $("<img>").addClass("preview_image");
  const imageInput = $("<input>").attr({
    type: "file",
    class: "notice_detail_one_file",
    name: "article_image",
    id: "notice_article_image",
    accept: "image/*",
  });
  // }).on("change", showPreviewImage);

  const imageSrc = image.find("img").attr("src");
  if (imageSrc) {
    imageInput.css({
      "background-image": `url('${imageSrc}')`,
      "background-size": "cover",
      "background-position": "center",
      "background-repeat": "no-repeat",
    });
  } else {
    imageInput.css("background-image", "none");
  }

  // image.html("").append(imagePreview, imageInput);
  image.html("").append(imageInput);

  $("#edit_button").hide();
  $("#save_button").show();
  $("#delete_button").hide();
  $("#cancel_button").show();
}

function cancelEditedArticle() {
  location.reload();
}

// /**
//  * 작성자 : 이준영
//  * 내용 : 이미지 미리보기
//  * 최초 작성일 : 2023.06.17
//  * 수정 내용 : 이미지 선택 해제 시 미리보기 삭제
//  * 업데이트 일 : 2023. 06.17
//  */
// function showPreviewImage(event) {
//     if (event.target.files.length > 0) {
//         var file = event.target.files[0];
//         var fileSize = file.size / 1024; // 파일 크기를 KB 단위로 계산
//         if (fileSize <= 300) {
//             var src = URL.createObjectURL(file);
//             $('.detail_one_file').css({
//                 'background-image': 'url(' + src + ')',
//                 'background-size': 'cover',
//                 'background-position': 'center',
//                 'background-repeat': 'no-repeat'
//             });
//         } else {
//             alert('이미지 파일 크기는 300KB 이하여야 합니다.');
//             $('#article_image').val('');
//             $('.detail_one_file').css('background-image', 'none');
//         }
//     } else {
//         $('.detail_one_file').css({
//             'background-image': 'none',
//             'background-size': 'auto',
//             'background-position': 'unset',
//             'background-repeat': 'unset'
//         });
//     }
// }

/**
 * 작성자: 공민영
 * 내용: 수정 후 저장 버튼 클릭 시 호출
 * 최초 작성일: 2023.06.15
 * 수정자: 이준영
 * 업데이트 내용: 업데이트 되게 수정, PUT > PATCH, Fetch > JQuery Ajax Request
 * 업데이트 일자: 2023.06.18
 */
function saveEditedArticle(articleId) {
  const editedTitle = $("#edit_notice_title").val();
  // CKEditor 인스턴스를 가져옵니다.
  var editedContent = CKEDITOR.instances.edit_notice_content.getData();
  // const editedImage = $("#article_image").prop("files")[0];

  const formdata = new FormData();
  formdata.append("title", editedTitle);
  formdata.append("content", editedContent);
  // if (editedImage !== undefined) {
  //   formdata.append("article_image", editedImage);
  // }

  $.ajax({
    type: "PATCH",
    url: `${backend_base_url}/article/notice/${articleId}/`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    data: formdata,
    processData: false,
    contentType: false,
    dataType: "json",
    success: function (response) {
      alert("수정이 완료되었습니다.");
      saveEdited();
      window.location.href = `${frontend_base_url}/notice_detail.html?article_id=${articleId}`;
    },
    error: function (xhr, status, error) {
      if (xhr.status === 401) {
        alert("토큰 만료! 재로그인하세요!");
        handleLogout();
      } else if (xhr.status === 403) {
        alert("본인 게시글만 수정 가능합니다.");
      } else {
        alert("잘못된 요청입니다.");
      }
    },
  });
}

/**
 * 작성자 : 공민영
 * 내용 : save_button 클릭 시 edit_button으로 변경
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
async function saveEdited() {
  const editButton = document.getElementById("edit_button");
  const saveButton = document.getElementById("save_button");
  editButton.style.display = "block";
  saveButton.style.display = "none";
}

/**
 * 작성자 : 공민영
 * 내용 : 내 게시글 삭제
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
async function deleteArticle(articleId) {
  let access_token = localStorage.getItem("access_token");

  if (confirm("삭제하시겠습니까? 24시간이 지나지 않은 게시글 삭제시 1000포인트 차감됩니다.")) {
    const response = await fetch(
      `${backend_base_url}/article/notice/${articleId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (response.status == 204) {
      alert("삭제가 완료되었습니다.");
      window.location.replace("notice.html");
    } else if (response.status == 401) {
      alert("토큰 만료! 재로그인하세요!");
      handleLogout();
    } else {
      alert("잘못된 요청입니다.");
    }
  }
}

/**
 * 작성자 : 공민영
 * 내용 : 내 게시글일 경우에만 수정/삭제버튼 보이기
 * 최초 작성일 : 2023.06.15
 * 최종 수정자 : 이준영
 * 수정 내용 : 함수가 잘 작동하게 수정함.
 * 업데이트 일자 : 2023.06.17
 */
async function setButtonVisibility() {
  const editButton = $("#edit_button");
  const deleteButton = $("#delete_button");

  const response = await getArticle(getArticleIdFromUrl());
  const loggedInUserId = response.user.pk;

  const payload = localStorage.getItem("payload");
  if (payload) {
    const payload_parse = JSON.parse(payload);
    const articleAuthorId = payload_parse.user_id;

    if (loggedInUserId === articleAuthorId) {
      editButton.show();
      deleteButton.show();
    } else {
      editButton.hide();
      deleteButton.hide();
    }
  } else {
    editButton.hide();
    deleteButton.hide();
  }
}

/**
 * 작성자 : 공민영
 * 내용 : 로그인 로그아웃 시 버튼 바꾸기
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
document.addEventListener("DOMContentLoaded", function () {
  var access_token = localStorage.getItem("access_token");
  if (access_token) {
    document.getElementById("login_container").style.display = "none";
  } else {
    document.getElementById("logged_in_container").style.display = "none";
    document.getElementById("logged_out").style.display = "none";
  }
});

/**
 * 작성자 : 공민영
 * 내용 : 로그아웃
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("payload");
  location.reload();
}

/**
 * 작성자 : 김은수
 * 내용 : 댓글 가져오기
 * 최초 작성일 : 2023.06.20
 * 업데이트 일자 : 2023.06.20
 */

async function getComments() {
  let article_id = getArticleIdFromUrl();
  const comments = await fetch(
    `${backend_base_url}/article/notice/${article_id}/commentcr`,
    {
      method: "GET",
    }
  );
  const comments_json = await comments.json();
  let profile_image = localStorage.getItem("pro");
  $("#notice_comments").empty();
  comments_json.forEach((a) => {
    let name = a["user"]["nickname"];
    let content = a["content"];
    let profile_image = a["user"]["profile_image"];
    let default_image = "https://dummyimage.com/50x50/ced4da/6c757d.jpg";

    let image = profile_image ? profile_image : default_image;
    let comment_id = a["id"];

    const commentAuthorId = a["user"]["id"];

    const payload = localStorage.getItem("payload");

    let buttons = "";
    if (payload) {
      const payload_parse = JSON.parse(payload);
      let loggedInUserId = payload_parse.user_id;

      if (loggedInUserId === commentAuthorId) {
        buttons = `<button class="notice_comment_edit_button_${comment_id}" onclick=noticeCommentPut(${comment_id})>수정</button>
        <button class="notice_comment_delete_button_${comment_id}" onclick=onDeleteNoticeComment(${comment_id})>삭제</button>
        <button class="notice_comment_save_button_${comment_id}" style="display:none" onclick=saveEditedNoticeComment(${comment_id})>저장</button>
        <button class="notice_comment_cancel_button_${comment_id}" style="display:none" onclick=cancelEditedNoticeComment(${comment_id})>취소</button>`;
      }
    }

    let temp = `<div class="d-flex">
                    <div class="flex-shrink-0"><img class="rounded-circle" src=${image}
                            alt=${default_image} /></div>
                    <div class="ms-3">
                        <div class="fw-bold">${name}</div>
                        ${buttons}
                        <p id=notice_comment_${comment_id}>${content}</p>
                    </div>
                </div>`;

    let good = a["good"];

    $("#notice_comments").append(temp);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("notice_comment_submit");
  button.addEventListener("click", postNoticeComment);
});

/**
 * 작성자 : 김은수, 공민영, 왕규원
 * 내용 : 댓글 작성하기
 * 최초 작성일 : 2023.06.21
 */
async function postNoticeComment() {
  const content = document.getElementById("notice_comment_post").value;
  const formdata = new FormData();
  formdata.append("content", content);

  let article_id = getArticleIdFromUrl();

  if (content == "") {
    alert("빈 댓글을 작성할 수 없음");
  } else if (article_id !== null) {
    const response = await fetch(
      `${backend_base_url}/article/notice/${article_id}/commentcr/`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: formdata,
      }
    );
  } else {
    alert("유효하지 않은 게시물");
  }
  getComments();
}

/**
 * 작성자: 김은수, 공민영
 * 내용: 댓글 수정 폼으로 변경
 * 최초 작성일: 2023.06.23
 */
async function noticeCommentPut(comment_id) {
  // let article_id = getArticleIdFromUrl();

  const noticeComment = $(`#notice_comment_${comment_id}`);
  noticeComment.html(`
      <input type="text" id="notice_edit_comment_${comment_id}" maxlength="200" value="${noticeComment.text()}">`);

  $(`.notice_comment_edit_button_${comment_id}`).hide();
  $(`.notice_comment_save_button_${comment_id}`).show();
  $(`.notice_comment_delete_button_${comment_id}`).hide();
  $(`.notice_comment_cancel_button_${comment_id}`).show();
}

/**
 * 작성자 : 공민영
 * 내용 : save_button 클릭 시 edit_button으로 변경
 * 최초 작성일 : 2023.06.15
 * 업데이트 일자 : 2023.06.15
 */
async function saveNoticeCommentEdited(comment_id) {
  const editCommentButton = document.getElementsByClassName(`notice_comment_edit_button_${comment_id}`);
  const saveCommentButton = document.getElementsByClassName(`notice_comment_save_button_${comment_id}`);
  editCommentButton.style.display = "block";
  saveCommentButton.style.display = "none";
}

/**
 * 작성자: 김은수, 공민영
 * 내용: 댓글 수정 후 저장
 * 최초 작성일: 2023.06.23
 */
function saveEditedNoticeComment(comment_id) {
  const editedNoticeComment = $(`#notice_edit_comment_${comment_id}`).val();
  article_id = getArticleIdFromUrl()
  const formdata = new FormData();
  formdata.append("content", editedNoticeComment);

  if (editedNoticeComment === undefined) {
    alert("내용은 필수입니다.");
    return;
  }

  $.ajax({
    type: "PATCH",
    url: `${backend_base_url}/article/notice/${article_id}/commentud/${comment_id}/`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    data: formdata,
    processData: false,
    contentType: false,
    dataType: "json",
    success: function (response) {
      alert("수정이 완료되었습니다.");
      saveNoticeCommentEdited();
      getComments();
      // window.location.href = `${frontend_base_url}/article_detail.html?article_id=${article_id}`;
    },
    error: function (xhr, status, error) {
      if (xhr.status === 401) {
        alert("토큰 만료! 재로그인하세요!");
        handleLogout();
      } else if (xhr.status === 403) {
        alert("본인 댓글만 수정 가능합니다.");
      } else {
        alert("잘못된 요청입니다.");
      }
    },
  });
}

function cancelEditedNoticeComment() {
  location.reload();
}

function onEditComment(articleId, commentId, newContent) {
  const requestUrl = `${backend_base_url}/article/notice/${articleId}/commentud/${commentId}/`;
  const requestBody = { content: newContent };
  fetch(requestUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (response.ok) {
        // 댓글 수정에 성공하면, 페이지 새로고침
        location.reload();
      } else {
        // 댓글 수정에 실패하면, 에러 메시지 출력
        throw new Error("댓글 수정에 실패했습니다.");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

// 댓글 삭제 버튼 클릭 이벤트 핸들러
function onDeleteNoticeComment(commentId) {
  article_id = getArticleIdFromUrl()
  const requestUrl = `${backend_base_url}/article/notice/${article_id}/commentud/${commentId}/`;
  fetch(requestUrl, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        // 댓글 삭제에 댓글가져오기
        getComments();
      } else {
        // 댓글 삭제에 실패하면, 에러 메시지 출력
        throw new Error("댓글 삭제에 실패했습니다.");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

/**
 * 작성자 : 왕규원
 * 내용 : 방법공유 게시판 좋아요 기능 추가
 * 최초 작성일 : 2023.07.03
 * 업데이트 일자 : 2023.07.03
 */

async function getArticleGoodView() {
  // 좋아요 수 가져오기
  const response = await getArticle(getArticleIdFromUrl());
  $("#goodCount").text(response.good.length);
  const goodCount = document.getElementById("goodCount");
}

//좋아요를 이미 눌렀는지 확인
async function GoodUser() {
  const response = await getArticle(getArticleIdFromUrl());
  const goodButton = $("#goodButton");
  const goodButtonCancle = $("#goodButtonCancle");

  const payload = localStorage.getItem("payload");
  if (payload) {
    const payload_parse = JSON.parse(payload);
    const loggedInUserId = payload_parse.user_id;

    let GoodUserId = false;

    for (let i = 0; i < response.good.length; i++) {
      const obj = response.good[i];

      if (obj === loggedInUserId) {
        GoodUserId = true;
        break;
      }
    }
    if (GoodUserId) {
      goodButtonCancle.show();
      goodButton.hide();
    } else {
      goodButtonCancle.hide();
      goodButton.show();
    }
  }
}

//좋아요 버튼 기능
async function ArticleGood() {
  const response = await getArticle(getArticleIdFromUrl());

  // 좋아요 버튼 요소 가져오기
  const goodButton = document.getElementById("goodButton");

  // 버튼 클릭 이벤트 핸들러
  goodButton.addEventListener("click", () => {
    let article_id = getArticleIdFromUrl();
    // 좋아요 요청 보내기
    fetch(`${backend_base_url}/article/notice/${article_id}/good/`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    })
      .then((response) => {
        if (response.ok) {
          GoodUser();
          getArticleGoodView();
        } else {
          console.error("좋아요 요청 실패");
        }
      })

      .catch((error) => {
        console.error("네트워크 오류:", error);
      });
  });
}

async function ArticleGood2() {
  const response = await getArticle(getArticleIdFromUrl());

  // 좋아요 버튼 요소 가져오기
  const goodButtonCancle = document.getElementById("goodButtonCancle");

  // 버튼 클릭 이벤트 핸들러
  goodButtonCancle.addEventListener("click", () => {
    let article_id = getArticleIdFromUrl();
    // 좋아요 요청 보내기
    fetch(`${backend_base_url}/article/notice/${article_id}/good/`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    })
      .then((response) => {
        if (response.ok) {
          GoodUser();
          getArticleGoodView();
        } else {
          console.error("좋아요 요청 실패");
        }
      })

      .catch((error) => {
        console.error("네트워크 오류:", error);
      });
  });
}

//좋아요 버튼 토글 기능
async function GoodToggle() {
  const goodButton = document.querySelector("#goodButton");
  const goodButtonCancle = document.querySelector("#goodButtonCancle");

  goodButton.addEventListener("click", () => {
    goodButtonCancle.classList.toggle("active");
  });

  goodButtonCancle.addEventListener("click", () => {
    goodButtonCancle.classList.remove("active");
  });
}
