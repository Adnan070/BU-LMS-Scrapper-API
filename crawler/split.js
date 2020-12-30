const cheerio = require("cheerio");
const { User } = require("../model/User");
const { main } = require("./scrap");

const getOneByOneAssignmentDeadlines = (val) => {
    $ = cheerio.load(val);
    let row = $(
        "body > div > div.content-wrapper > section.content >\
    div > div > div > div.box-body.table-responsive.no-padding > table tbody",
    ).children("tr");
    let futureAssignment = [];
    let passedAssignment = [];
    row.toArray().map((value, index, el) => {
        let elementText = cheerio.html(value);
        // console.log(elementText)
        if (!elementText.includes("<th>")) {
            if (elementText.includes("Deadline Exceeded")) {
                passedAssignment.push(elementText);
            } else {
                // console.log(true);
                // console.log(elementText);
                futureAssignment.push(elementText);
            }
        }
    });
    return { passedAssignment, futureAssignment };
};

const getData = (ass) => {
    if (!ass) return;
    let $ = cheerio.parseHTML(ass);

    let getText = (element) => {
        let text = "";
        if (element.type === "text" && element.data.trim() === "") {
            return text;
        }
        if (element.children.length === 1) {
            text = element.children[0].data.trim();
        } else {
            for (let i = 0; i < element.children.length; i++) {
                let data = element.children[i];
                if (data.type === "text") {
                    text = data.data.trim();
                    break;
                } else if (data.name === "span") {
                    text = data.children[0].data.trim();
                    break;
                } else if (data.name === "small") {
                    if (data.attribs.title.trim() === "Extended") {
                        text = "Extended : " + data.children[0].data;
                        break;
                    } else if (data.attribs.title === "Actual") {
                        text = "Actual" + data.children[0].data;
                        break;
                    }
                }
            }
        }
        // console.log(text);
        return text;
    };

    let assignments = {};

    //   console.log($);
    $ = $[0].children;

    //   console.log(cheerios.html($));
    let tdCount = 0;
    for (let i = 0; i < $.length; i++) {
        let element = $[i];
        if (element.type === "tag") {
            let text = getText(element);
            //   console.log(tdCount)
            if (tdCount === 1) {
                assignments.Title = text;
            } else if (tdCount === 4) {
                assignments.Remarks = text;
            } else if (tdCount === 5) {
                if (text.trim() === "No Submission") {
                    assignments.Submitted = false;
                } else {
                    assignments.Submitted = true;
                }
            } else if (tdCount === 6) {
                assignments.Marks = text;
            } else if (tdCount === 7) {
                assignments.Comment = text;
            } else if (tdCount === 9) {
                assignments.Action = text;
            } else if (tdCount === 10) {
                assignments.Date = text;
            }
            tdCount++;
        }
    }
    return assignments;
};

const getRowData = (ass) => {
    let futureAssignment = [],
        passedAssignment = [];
    if (ass.futureAssignment.length) {
        ass.futureAssignment.forEach((element) => {
            // console.log(element , '\n\n\n')
            futureAssignment.push(getData(element));
        });
    }
    if (ass.passedAssignment.length) {
        ass.passedAssignment.forEach((element) => {
            // console.log(element)
            passedAssignment.push(getData(element));
        });
    }

    return { futureAssignment, passedAssignment };
};

exports.separation = async ({ coursePages: pages, values }) => {
    // let courseData = [];
    let $,
        rowData = [],
        keys = [];

    // console.log(pages[1])

    // let ass = getOneByOneAssignmentDeadlines(pages[2]);
    // console.log(ass)
    // let row = getRowData(ass);
    // console.log(row)
    // console.log('Test: ',pages.length > 0 && values.length ===  pages.length)
    // // main(enroll, pass).then(({coursePages:pages, values}) => {
    if (pages.length > 0 && values.length === pages.length) {
        console.log("before");

        for (let i = 0; i < pages.length; i++) {
            console.log(i);
            let ass = getOneByOneAssignmentDeadlines(pages[i]);
            // console.log('after',ass)
            let row = getRowData(ass);
            // console.log(row)
            rowData.push(row);
            keys.push(values[i].value[0]);
        }
        console.log(rowData);
    }
    // })
    // .catch((err) => {
    //     console.log(err)
    // })

    return { keys, rowData };
};
