const fetchEmails = async (page = 1) => {
  return fetch(`/_mail_api/mails?_page=${page}&_limit=10`).then((response) =>
    response.json()
  );
};

$(async () => {
  const emails = await fetchEmails();

  const list = $("#hbs-mail-list").list("hbs-mail-item", "_mail_list_item");

  dayjs.extend(dayjs_plugin_relativeTime);

  console.log(dayjs(emails[0].date).fromNow());

  emails.forEach((mail) =>
    list.append({
      ...mail,
      date: dayjs(emails[0].date).fromNow(),
    })
  );

  console.log(emails);
});
