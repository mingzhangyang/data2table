export default function createNotificationBar(datatable) {
  let notifySection = document.createElement('div');
  notifySection.id = datatable._targetId + '-notification-section';
  notifySection.classList.add('notification-section');
  let progressBar = notifySection.appendChild(document.createElement('div'));
  progressBar.classList.add('progress-bar');
  let dotWrapper = progressBar.appendChild(document.createElement('div'));
  dotWrapper.classList.add('progress-dot-wrapper');
  for (let i = 0; i < 3; i++) {
    let sp = dotWrapper.appendChild(document.createElement('span'));
    sp.classList.add('progress-dot');
    sp.classList.add(`dot-num-${i + 1}`);
  }
  let errorBar = notifySection.appendChild(document.createElement('div'));
  errorBar.classList.add('error-message');
  errorBar.classList.add('message-bar');
  let alertBar = notifySection.appendChild(document.createElement('div'));
  alertBar.classList.add('alert-message');
  alertBar.classList.add('message-bar');

  return notifySection;
}