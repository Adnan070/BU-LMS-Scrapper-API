const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

const goToLMS = async (page) => {
  await page.goto('https://cms.bahria.edu.pk/Sys/Common/GoToLMS.aspx')
  await page.goto('https://lms.bahria.edu.pk/Student/Assignments.php')
  const content = await page.content()

  return `${content}`
}

const login = async (page, enroll, pass) => {
  await page.goto('https://cms.bahria.edu.pk/Logins/Student/Login.aspx')

  await page.type("[name='ctl00$BodyPH$tbEnrollment']", `${enroll}`)
  await page.type("[name='ctl00$BodyPH$tbPassword']", `${pass}`)
  await page.select('#BodyPH_ddlInstituteID', '2')
  await page.select('#BodyPH_ddlSubUserType', 'None')
  await page.click("[id='BodyPH_btnLogin']")
  await page.waitForNavigation()
  const content = await page.content()
  //   console.log(content);
  return `${content}`
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

exports.main = async (enroll, pass) => {
  // const browserFetcher = puppeteer.createBrowserFetcher();
  // const localChromiums = await browserFetcher.localRevisions();
  // console.log('Local Chromium: ',localChromiums);

  // if (!localChromiums.length)
  //   return console.error("Can't find installed Chromium");

  // const { executablePath } = await browserFetcher.revisionInfo(
  //   localChromiums[0]
  // );

  // console.log(executablePath);

  const browser = await puppeteer.launch({
    // headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // executablePath: '/usr/bin/google-chrome-stable /usr/share/man/man1/google-chrome-stable.1.gz',
  })
  const page = await browser.newPage()
  let values = []
  let coursePages = []
  let $ = cheerio.load(await login(page, enroll, pass))
  if ($('#ProfileInfo_lblUsername').text() == enroll) {
    $ = cheerio.load(await goToLMS(page))
    await setTimeout(() => {}, 1000)

    if ($('#courseId').length) {
      $('select#courseId option').each(function (index) {
        values.push({
          key: $(this).val(),
          value: $(this).text().trim().split('\n'),
        })
      })

      values.shift()
      let i = 0
      for (let i = 0; i < values.length; i++) {
        let content
        await Promise.all([
          await page.select('#courseId', values[i].key),
          (content = await page.content()),
          // await page.waitForNavigation(),
        ])

        coursePages.push(`${content}`)
        // await sleep(1000);
        // setTimeout(async () => {
        //   await page
        //     .select("#courseId", values[i])
        //     .then(() => {
        //       return page.content();
        //     })
        //     .then((content) => {
        //       coursePages[i] = `${content}`;
        //     })
        //     .catch((err) => {
        //       console.log(err);
        //     });
        // }, 5000);
      }
      // console.log(coursePages);
    }
  } else if (
    $(
      '#pageContent > div.container-fluid > div.row > div > div:nth-child(1) > div > strong',
    ).text() === 'Error!'
  ) {
    browser.close()
    return false
  }
  await browser.close()
  return { coursePages, values }
}
