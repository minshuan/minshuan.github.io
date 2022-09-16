// A character filter for enlist in the game TenkafuMA!
// @author purindaisuki

//global variable
var queryTagNum

// Set up color theme
document.addEventListener("DOMContentLoaded", () => {
    // Set theme when DOM is ready
    let colorThemeCheckbox = document.querySelector("#color-mode-checkbox")

    // Set default theme according to user's preference from local storage or at OS level
    if (localStorage.getItem("color-mode") == "dark"
        || window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("color-mode", "dark")
        colorThemeCheckbox.checked = true
    }

    // toggle color theme
    colorThemeCheckbox.addEventListener("change", event => {
        let toTheme = event.target.checked ? "dark" : "light"
        document.documentElement.setAttribute("color-mode", toTheme)
        localStorage.setItem("color-mode", toTheme)
    })

    // populate tags
    populateTags()
});

window.onload = () => {
    queryTagNum = 0

    // help info button
    let helpModal = document.querySelector("#help-modal")
    document.querySelector("#help-icon").addEventListener("click", () => {
        helpModal.style.display = "block"
    })

    // close help modal button
    document.querySelector("#close-help-modal").addEventListener("click", () => {
        helpModal.style.display = "none"
    })

    let tagsModal = document.querySelector("#tags-modal")
    document.querySelector("#tags-icon").addEventListener("click", () => {
        tagsModal.style.display = "block"
    })

    // close help modal button
    document.querySelector("#close-tags-modal").addEventListener("click", () => {
        tagsModal.style.display = "none"
    })

    // back to top button
    document.querySelector("#to-top-icon").addEventListener("click", () => {
        document.body.scrollTop = 0 // For Safari
        document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
    })

    // close modal when user clicks outside of the modal
    window.onclick = (event) => {
        if (event.target == helpModal)
            helpModal.style.display = "none"
        if (event.target == infoModal)
            infoModal.style.display = "none"
    }

    // inactive all tags
    document.querySelector("#delete-icon").addEventListener("click", event => {
        Array.from(document.querySelectorAll(".tag"))
        .forEach(tag => {
            tag.classList.remove("tag-active")
            tag.classList.remove("tag-plant_level-active")
            tag.classList.remove("tag-temperature-active")
            tag.classList.remove("tag-light-active")
            tag.classList.remove("tag-body-active")
            tag.classList.remove("tag-humidity-active")
            tag.classList.remove("tag-plant_type-active")
            tag.classList.remove("tag-else-active")
            queryTagNum = 0
            document.querySelector("#result").innerHTML = ""
        })
    })

    // sort table
    document.querySelectorAll("th").forEach((th, _, ths) => th.addEventListener("click", () => {
        let isAsc = false
        // update order
        ths.forEach(thead => {
            if (thead.classList.contains("asc") && thead == th)
               isAsc = true
        })
        sortTable(th, !isAsc)
    }))
}

/**
 * Sort table content
 * @param {HTMLElement} target sort table content by the element
 * @param {boolean} toAsc whether it's in ascending order
 */
function sortTable(target, toAsc) {
    const getCellValue = (tr, idx) => tr.children[idx].innerHTML
    const comparator = (idx, asc) => (a, b) => getCellValue(asc ? a : b, idx).localeCompare(getCellValue(asc ? b : a, idx))
    const table = document.querySelector("#result")
    const ths = document.querySelectorAll("th")
    ths.forEach(thead => {
        thead.classList.remove("asc")
        thead.classList.remove("desc")
    })
    target.classList.add(toAsc ? "asc" : "desc")
    Array.from(table.querySelectorAll("tr"))
    .sort(comparator(Array.from(ths).indexOf(target), toAsc))
    .forEach(tr => table.appendChild(tr))
}

/**
 * populate tags into filter body
 */
function populateTags() {
    let tagList = document.querySelector("#tag-container")
    fetch('./tags.json')
    .then(response => response.json())
    .then(data => {
        for (const attr of data)
            attr.tags.forEach(tag => {
                tagList.appendChild(createTagElemet(attr.attribute, tag))
            })

        // set table max height
        let height = document.querySelector("#filter-panel").offsetHeight
        document.querySelector("#result-container")
        .setAttribute("style", "max-height:" + height + "px")
    })
}

/**
 * create tag in HTMLElement
 * @param {String} attribute attribute of the tag
 * @param {attribute} tagStr name of the tag
 * @returns {HTMLElement} tag in HTMLElement
 */
function createTagElemet(attribute, tagStr) {
    let tag = document.createElement("div")
    tag.classList.add("tag")
    tag.classList.add("tag-" + attribute)
    // create tag icon
    let icon = createIconElement("#" + attribute + "-icon")
    icon.classList.add("filter-icon")
    icon.classList.add("tag-icon")
    // add tag text
    let tagText = document.createElement("span")
    tagText.innerHTML = tagStr
    tag.appendChild(icon)
    tag.appendChild(tagText)
    // toggle tag
    tag.addEventListener("click", () => {
        if (tag.classList.contains("tag-" + attribute + "-active")) {
            tag.classList.remove("tag-active")
            tag.classList.remove("tag-" + attribute + "-active")
            queryTagNum--;
            if (queryTagNum == 0) {
                document.querySelector("#result").innerHTML = ""
                return
            }
        }
        else {
          if (queryTagNum >= 7) {
                alert("標籤數至多7個")
                return
            }
            tag.classList.add("tag-active")
            tag.classList.add("tag-" + attribute + "-active")
            queryTagNum++;
        }
        filter()
    })
    return tag
}

/**
 * create icon in HTMLElement
 * @param {String} iconId id of the icon HTMLElement
 * @returns {HTMLElement} icon in HTMLElement
 */
function createIconElement(iconId) {
    let useIcon = document.createElementNS("http://www.w3.org/2000/svg", "use")
    useIcon.setAttributeNS("http://www.w3.org/1999/xlink", "href", iconId)
    let icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    icon.appendChild(useIcon)
    return icon
}

/**
 * create tooltip HTMLElement
 * @param {String} tagStr name of the tag
 * @returns {HTMLElement} tooltip HTMLElement
 */
function createTooltip(tagStr) {
    let tooltipContainer = document.createElement("div")
    tooltipContainer.classList.add("distinct")
    tooltipContainer.appendChild(createIconElement("#star-icon"))
    let text = document.createElement("span")
    text.innerHTML = tagStr
    tooltipContainer.appendChild(text)
    // replace event by showing tooltip
    tooltipContainer.addEventListener("click", event =>  event.stopImmediatePropagation())
    return tooltipContainer
}

/**
 * filter the characters by chosen tags
 */
function filter() {
    let queryTags = []
    Array.from(document.querySelectorAll(".tag")).forEach(tag => {
        if (tag.classList.contains("tag-active"))
            queryTags.push(tag.children[1].innerHTML)
    })

    const enlistHour = 9

    fetch('./tags.json')
    .then(response => response.json())
    .then(tags => {
        charAttributes = tags
        return fetch('./plant_tag.json')
    })
    .then(response => response.json())
    .then(chars => {
        // retrieve attributes and tags organized by attributes
        charAttrs = []
        for (const attr of charAttributes)
            charAttrs.push([attr.attribute, attr.tags])

        let result = document.querySelector("#result")
        result.innerHTML = ""

        for (let k = 7; k > 0; k--) {
            // generate combinations
            const queryTagsComb = Array.from(combinations(queryTags, k))

            // screen out ineligible characters
            queryTagsComb.forEach(queryTags => {
                let appliedTags = []
                // filter by class and time
                var fChars
                    fChars = enlistHour == 9 ? chars : chars.filter(char => char.grade <= 3)

                // filter by plant_level, temperature, light, body and humidity
                for (let i = 0; i < 7; i++) {
                    if (queryTags.length == 0 || fChars.length == 0)
                        break
                    charAttrs[i][1].forEach(attrTag => {
                        if (queryTags.includes(attrTag)) {
                            fChars = fChars.filter(t => t[charAttrs[i][0]] == attrTag)
                            appliedTags.push(attrTag)
                            queryTags.splice(queryTags.indexOf(attrTag), 1)
                        }
                    })
                }

                // filter by the rest tags
                const survivors = fChars.filter(char => queryTags.every(t => char.tags.includes(t)))
                queryTags = queryTags.concat(appliedTags)
                let queryTagsStr = queryTags.join(", ")

                let isDistinct = false
                // whether any three (or fewer) tags can lead to only one characters
                if (survivors.length == 1 && queryTags.length <= 3)
                    isDistinct = true

                let addedChars = Array.from(result.children)
                if (addedChars.length > 0)
                chars = chars.filter(char => !addedChars.some(s => s.children[0].innerText == char))

                // update result
                survivors.forEach(survivor => {
                    let isExist = false
                    addedChars.forEach(c => {
                        if (c.children[0].childNodes[0].nodeValue != survivor.name)
                            return true
                        isExist = true
                        if (isDistinct) {
                            let distinctTagElement = c.children[0].children[0]
                            if (distinctTagElement != null) {
                                // update tooltip
                                let curText = distinctTagElement.children[1]
                                let curTagsSet= curText.innerHTML.split("\n")
                                let contains = false
                                for (let i = curTagsSet.length - 1; i >= 0; i--) {
                                    // delete tags if contains another
                                    let curTags = curTagsSet[i].split(", ")
                                    let tagStrs = queryTagsStr.split(", ")
                                    if (tagStrs.every(queryTag => curTags.includes(queryTag))) {
                                        curTagsSet.splice(i, 1)
                                        contains = true
                                    }
                                }
                                if (contains)
                                    curText.innerHTML = curTagsSet.concat([queryTagsStr]).join("\n")
                                else {
                                    // add distinct tags
                                    curTagsSet.push(queryTagsStr)
                                    curText.innerHTML = curTagsSet.join("\n")
                                }
                            } else {
                                // create tooltip
                                c.children[0].appendChild(createTooltip(queryTagsStr))
                            }
                        }
                    })

                    if (isExist)
                        return true

                    let row = result.insertRow()
                    let nameCol = row.insertCell()
                    let infoCol = row.insertCell()
                    let rarityCol = row.insertCell()
                    let temperatureCol = row.insertCell()
                    let appliedTagsCol = row.insertCell()

                    row.setAttribute("class", survivor.plant_level)
                    nameCol.innerHTML = survivor.name
                    switch (survivor.grade) {
                        case 3:
                            rarityCol.innerHTML = "蔓綠絨"
                            break
                        case 2:
                            rarityCol.innerHTML = "觀音蓮"
                            break
                        case 1:
                            rarityCol.innerHTML = "火鶴"
                            break
                        default:
                            rarityCol.innerHTML = "其他"
                    }
                    infoCol.innerHTML = survivor.info
                    temperatureCol.innerHTML = survivor.temperature
                    appliedTagsCol.innerHTML = queryTagsStr
                    appliedTagsCol.style.cursor = "pointer"
                })
            })
        }
        // sort results by rarity
        // sortTable(document.querySelector("#rarity"), false)
    })
}

/**
 * generate the k-combination of elements
 * @param {Array<T>} elements
 * @param {Number} num k distinct elements
 */
function* combinations(elements, num) {
    for (let i = 0; i < elements.length; i++) {
        if (num === 1)
            yield [elements[i]]
        else {
            let remaining = combinations(elements.slice(i + 1, elements.length), num - 1)
            for (let next of remaining)
                yield [elements[i], ...next]
        }
    }
}
