/**
 * Show status on the top of the table
 * @param id: the _targetId of DataTable instance
 * @param status: <Object> {type: 'progress|success|error'(required), message: <String> (optional)>}
 */
function notifyStatus(id, status) {
  let ns = document.getElementById(id + '-notification-section');
  let msgs = ns.getElementsByClassName('message-bar');
  switch (status.type) {
    case 'progress':
      ns.classList.add('progress-active');
      ns.classList.remove('error-active', 'alert-active');
      break;
    case 'error':
      ns.classList.add('error-active');
      ns.classList.remove('alert-active', 'progress-active');
      msgs[0].innerText = status.message;
      break;
    case 'alert':
      ns.classList.add('alert-active');
      ns.classList.remove('error-active', 'progress-active');
      msgs[1].innerText = status.message;
      break;
    case 'success':
      ns.classList.remove('progress-active');
      ns.classList.remove('error-active', 'alert-active');
      break;
    default:
      ns.classList.remove('progress-active');
      ns.classList.remove('error-active', 'alert-active');
  }
}

export default notifyStatus;
 