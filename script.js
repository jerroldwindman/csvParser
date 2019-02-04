

/**
Event handler for the submit button:


@param {event object} event used to execute 'preventDefault()' which would
reload the page after the AJAX get request


1. Calls the clearPrevious function which will remvoe any residual data from the tables if
we are loading a new set of data
2. Creates the local Host Path to the CSV file located in the project directory
3. Calls the handleData function after the request is made for the data in the document

*/
$('#sub').click(function(event){
	clearPrevious();
	let localHostPath = `http://localhost:8000/Documents/GG%20Interview%20Project/`;
	let documentName = document.querySelector('#csv').value;
	documentName = documentName.slice(12, 25);
	let URL = `${localHostPath}${documentName}`
	$.get(
		URL,
		handleData
	);
	
	
	event.preventDefault();
});

/**
Removes all of the data from the table and the various containers
to make room for a new set of data
*/
function clearPrevious(){
	//tableWrapper is the container for the data table itself
	let tableWrapper = document.querySelector('#tableWrapper');
	while(tableWrapper.hasChildNodes()){
		document.querySelector('#tableWrapper').removeChild(document.querySelector('#tableWrapper').childNodes[0]);
	}
	
	//currentRowNumDiv and OriginlRowNumDiv are the containers for the rowNumbers
	let currentRowNumDiv = document.querySelector('#tableOfCurrentRowNum');
	let originalRowNumDiv = document.querySelector('#tableOfOriginalRowNum');
	if(currentRowNumDiv.hasChildNodes()){
		currentRowNumDiv.removeChild(currentRowNumDiv.childNodes[0]);
	}
	if(originalRowNumDiv.hasChildNodes()){
		originalRowNumDiv.removeChild(originalRowNumDiv.childNodes[0]);
	}
	
	//statsContainer holds the stats tables for each column head
	let statsContainer = document.querySelector('#statsContainer');
	while(statsContainer.hasChildNodes()){
		statsContainer.removeChild(statsContainer.children[0]);
	}
}

/**

handleData(data, result)

@param {string} data 	the result of the AJAX call to the file, a string containing the 
						contents of the CSV file
@param {boolean{} result the result of the AJAX call, used to check whether the AJAX call 
						successfully returned the contents of the file


Manipulates the data contained in the result string and calls various handler functions for 
placing data in the table and setting up the row numbers

*/
function handleData(data, result){
	if(result == 'success'){
		
		//creates table and adds it to container
		let dataTable = document.createElement('table');
		dataTable.setAttribute('id', 'data');
		document.querySelector('#tableWrapper').appendChild(dataTable);
		
		
		//splits the string data along the '\n' character so that each
		//array location contains the next row in the CSV file
		let rowSplitArray = data.split('\n')
		
		//splits the first row of data (column headers) and the second row of data
		//(used for example) along the ',' so that each variable contains
		//an array of data values
		let dataColumnHeaders = rowSplitArray[0].split(',');
		let exampleData = rowSplitArray[1].split(',');
		
		
		let headers = buildColumnHeaders(dataColumnHeaders, exampleData);
		
		//splits each row of data along the ',' so that each array location
		//in dataSplitArray contains an array of the row data for that row
		let dataSplitArray = [];
		for(let i = 1; i < rowSplitArray.length; i++){
			dataSplitArray[i] = rowSplitArray[i].split(',');
		}
		
		//Always a '\n' character at the end of file which created one extra empty row
		dataSplitArray.pop();
		
		let finalTable = buildRows(dataSplitArray, headers);
		
		//create two tables for the row numbers (original and current)
		let currentRowNumTable = document.createElement('table');
		let originalRowNumTable = document.createElement('table');
		
		currentRowNumTable.setAttribute('id', 'rowNumArray');
		
		//goes through the data and for each row creates two new
		//table rows, one for each rowNum container and appends them
		//to the table
		for(let i = 1; i < dataTable.children.length; i++){
				let temp1 = document.createElement('tr');
				let temp2 = document.createElement('tr');
				temp2.innerText = finalTable.childNodes[i].dataset.originalrownum;
				temp1.setAttribute('class', 'rowNum');
				temp2.setAttribute('class', 'originalRowNum');
				currentRowNumTable.appendChild(temp1);
				originalRowNumTable.appendChild(temp2);
		}
		
		let currentRowNumDiv = document.querySelector('#tableOfCurrentRowNum');
		let originalRowNumDiv = document.querySelector('#tableOfOriginalRowNum');
		
		//append the tables to the divs
		currentRowNumDiv.appendChild(currentRowNumTable);
		originalRowNumDiv.appendChild(originalRowNumTable);
		
		//setUpEventListeners for making application interactive
		setUpEventListeners();
		
	}
	else{
		//if the AJAX call returned false for success, we notify
		//the user someting went wrong
		alert('Something went wrong!');
		console.log(data);
		console.log(result);
	}
}

/**

Builds column headers based on templates defined in the HTML

@param {array[string]} dataColumns  an array of the column titles
@param {array[string|number]} exampleData an array of the first row of data, 
											  used to find column types
@returns {array['#headerNode']} rowNode an array of #headerNodes (see HTML templates)


*/
function buildColumnHeaders(dataColumns, exampleData) {
	let rowNode = document.createElement('tr');
	let statsContainer = document.querySelector('#statsContainer');
	
	//this first row containing the column headers will always be known as column 0
	//regardless of the filtering and sorting that occurs
	rowNode.setAttribute('data-rownum', '0');
	for(let i = 0; i < dataColumns.length; i++){
		
		//grab a template for the headerNode and clone it unwrap it
		let headerNode = document.querySelector('#headerNode');
		let newHeaderNodeFragment = document.importNode(headerNode.content, true);
		let newHeaderNode = newHeaderNodeFragment.childNodes[1];
		
		//put column number and the name of the data column in the headerNode
		newHeaderNode.setAttribute('data-colnum', i);
		newHeaderNode.childNodes[1].innerText = dataColumns[i].trim();
		
		//if the example data value associated with this column is not a number
		if(isNaN(exampleData[i])){	
			newHeaderNode.setAttribute('data-type', 'string');
			//grab a template for the stringMenu and clone and unwrap it
			let stringMenu = document.querySelector('#stringMenu');
			let newStringMenuFragment = document.importNode(stringMenu.content, true);
			let newStringMenu = newStringMenuFragment.childNodes[1];


			//put column number as attribute in the menu itself, and in the
			//input box for filtering (filters added by user will also get column number)
			newStringMenu.setAttribute('data-colnum', i);
			newStringMenu.querySelector('input').setAttribute('data-colnum', i);
			
			//grab a template for the stringStatsMenu an clone and unwrap it
			let stringStatsMenu = document.querySelector('#stringStats');
			let newStringStatsMenuFragment = document.importNode(stringStatsMenu.content, true);
			let newStringStatsMenu = newStringStatsMenuFragment.childNodes[1];
			
			
			newStringStatsMenu.setAttribute('data-colnum', i);
			newStringStatsMenu.setAttribute('data-type', 'string');
			//append stringMenu to the headerNode and append the statsMenu to the statsContainer
			newHeaderNode.appendChild(newStringMenu);
			statsContainer.appendChild(newStringStatsMenu);
			
		}
		else{
			newHeaderNode.setAttribute('data-type', 'number');
			//grab a template for the numberMenu and clone and unwrap it
			let numberMenu = document.querySelector('#numberMenu');
			let newNumberMenuFragment = document.importNode(numberMenu.content, true);
			let newNumberMenu = newNumberMenuFragment.childNodes[1];
			
			newNumberMenu.setAttribute('data-colnum', i);
			newNumberMenu.querySelector('input').setAttribute('data-colnum', i);
						
			//grab a template for the numStatsMenu and clone and unwrap it			
			let numStatsMenu = document.querySelector('#numStats');
			let newNumStatsMenuFragment = document.importNode(numStatsMenu.content, true);
			let newNumStatsMenu = newNumStatsMenuFragment.childNodes[1];
			
			newNumStatsMenu.setAttribute('data-colnum', i);
			newNumStatsMenu.setAttribute('data-type', 'number');
			
			//append numberMenu to the headerNode and append the statsMenu to the statsContainer
			newHeaderNode.appendChild(newNumberMenu);
			statsContainer.appendChild(newNumStatsMenu);			
		}
		//append the new header to row 0, the row containing the columnHeaders
		rowNode.appendChild(newHeaderNode);
	}
	//append the whole rowNode containing all of the headerNodes to the data table
	document.querySelector('#data').appendChild(rowNode);
	//return the row containing the headerNodes
	return rowNode;
	
}
/**

@param {array[array[string|number]]} dataSplit An array of the data to be displayed
												in the data table, where each array location
												contains an array of the data to be placed
												in that row
@param {<tr>} headers A table row containing the <th> headers for each column 
											
Goes through the data in the dataSplit array and creates a table row (<tr>) for each array location
in dataSplit array and then goes through each array location and and creates a table data object <td>
for each piece of data in each row, and appends all of the data to the associated rows, and each row
to the main data table

@returns {<table>} dataTable The table element containing all of the data in the CSV file

*/

function buildRows(dataSplit, headers){
	let dataTable = document.querySelector('#data');
	for(let i = 1; i < dataSplit.length; i++){
		//create a new rowNode (<tr>)
		let rowNode = document.createElement('tr');
		
		//label each rowNode
		rowNode.setAttribute('data-originalrownum', i);
		rowNode.setAttribute('data-currentrownum', i);
		rowNode.setAttribute('data-active', 'true');
		rowNode.setAttribute('class', 'datarow');
		
		//for every piece of in the array location
		for(let j = 0; j < dataSplit[i].length; j++){
			//create a new dataNode (<td>)
			let dataNode = document.createElement('td');
			
			//append data and label dataNode
			dataNode.innerText = dataSplit[i][j].trim();
			dataNode.setAttribute('data-column', headers.children[j].innerText);
			dataNode.setAttribute('data-colnum', j);
			
			//append the dataNode to the rowNode
			rowNode.appendChild(dataNode);
		}
		//append the rowNode to the data table
		dataTable.appendChild(rowNode);
	}
	//generate stats based on the original table elements (before sorting or filtering)
	generateNumericalStats();
	generateStringStats();
	return dataTable;
}

/**

@param {eventObject} event An event used to determine which type of sort was requested and
							on which column the sort is to occurs
							
A function for sorting the data in the table based on the column chosen and the type of 
sort chosen by the user, handles sorting of both strings and numbers						

*/
function sort(event){
	var arr = [];
    let table = document.querySelector("#data");
	let i = 0;
	let requestedSort = event.target;
	
	//remove all of the table rows in the table
	while(table.hasChildNodes()){
		arr[i] = table.removeChild(table.firstChild);
		i++;
	}
	//put the columnHeaders back
	table.appendChild(arr[0]);
	//remove the array entry for the columnHeaders
	arr = arr.slice(1, arr.length);
	
	//obtain the column number of the column we are sorting based on
	let columnNumber = requestedSort.parentNode.dataset.colnum;
	
	//perform a check to see which type of sort is being requested and then sort the
	//array based on that check
	if (requestedSort.innerText == "Sort A-Z") {
        arr.sort(function(a, b) {
			let x = a.children[columnNumber].innerText.toLowerCase();
            let y = b.children[columnNumber].innerText.toLowerCase();
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        });
    } else if (requestedSort.innerText == "Sort Z-A") {
        arr.sort(function(a, b) {
            let x = a.children[columnNumber].innerText.toLowerCase();
            let y = b.children[columnNumber].innerText.toLowerCase();
            if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
            return 0;
        });
    } else if (requestedSort.innerText == 'Sort Low to High'){
		arr.sort(function(a,b) {
			let x = parseInt(a.children[columnNumber].innerText);
			let y = parseInt(b.children[columnNumber].innerText);
			if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
		});
	} else if(requestedSort.innerText == 'Sort High to Low'){
		arr.sort(function(a,b) {
			let x = parseInt(a.children[columnNumber].innerText);
			let y = parseInt(b.children[columnNumber].innerText);
			if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
            return 0;
		});
	}
	//put all of the data rows back in the table, in their new order
    for (let i = 0; i < arr.length; i++) {
		table.appendChild(arr[i]);
    }
	//calculate the new row numbers based on the sort that just occurred
	newRowNums(table, table.children.length);
	//make sure each row is also displaying its original row number in the table
	setOriginalRowNums(table);
}

/**

A handler function for filtering the data table any time a change is
made to a filter in one of the columnHeads filtering menu

*/
function filter(){
	
	let table = document.querySelector('#data');
	
	//obtain which filters are active and their associated column numbers
	let activeFiltersAndColumnNumbers = testFilters();
	let activeFilters = activeFiltersAndColumnNumbers[0];
	
	//if there were active filters present
	if(!(activeFilters.length === 0)){	
		
		let columnNumbers = activeFiltersAndColumnNumbers[1];
		let rowNumbers = document.querySelector('#rowNumArray');
		let j = 1;
		//test each row in the data table against the active filtering
		//conditions
		for(let i = 1; i < table.children.length; i++){
			let rowNode = table.childNodes[i];
			test(rowNode, activeFilters, columnNumbers);
		}
		//calculate the new row numbers based on the filter that just occurred
		newRowNums(table, table.children.length);
		//make sure each row is also displaying its original row number in the table
		setOriginalRowNums(table);
	}
	else{
		//if there were no active filters, make sure all of the data in the table is showing
		reactivateTable();
	}
	//place string representations of the active filters in the statsMenus for the associated
	//columns
	recognizeFilters(table);
	//generate stats based on the table elements after being filtered
	generateNumericalStats();
	generateStringStats();
}

/**
@param {<table>} table The data table containing all of our parsed data from the CSV

This function loops through the activeFiltersDivs in each statsMenu (each column has a stats menu)
and removes the text which describes the filters being applied to that column
Then the function loops through all of the filters, and creates new string representations
of the filters being applied to each column, and appends these string representations
to the associated statsMenu for the column

*/

function recognizeFilters(table){
	//for every columnHead in the data table
	for(let i = 0; i < table.children[0].children.length; i++){
		//obtain the statsMenu and activeFiltersDiv associated with that columnHead
		let statsMenu = document.querySelector(`.statsMenu[data-colnum='${i}']`);
		let activeFiltersDiv = statsMenu.querySelector('.displayActiveFilters');
		
		//while there is still text written in the activeFiltersDiv, remove it
		while(activeFiltersDiv.children.length > 0){
			activeFiltersDiv.removeChild(activeFiltersDiv.firstChild);
		}
		
		//obtain all of the filter divs for a columnHead, and the columnType
		let filters = table.children[0].children[i].querySelectorAll(`.filter`);
		let filterType = table.children[0].children[i].querySelector(`input`).className;
		
		//check what type of filtering is being dealt with
		if(filterType == 'stringFilter'){
			let activeFiltersString = `Filtering on: `;
			//for every filter associated with this columnHead
			for(let j = 0; j < filters.length; j++){
				//obtain the input of the current filter div
				let currInput = filters[j].querySelector('input').value;
				//if the filter is not empty, add it to the string representation of the filters
				if(currInput !== ''){
					activeFiltersString += `"${currInput}"`
				}
			}
			//add the string representation of the filters to this columnHead's statsMenu
			activeFiltersDiv.innerText = activeFiltersString;
		}
		else if(filterType == 'numberFilter'){
			let activeFiltersString = `Filtering on: `;
			for(let j = 0; j < filters.length; j++){
				let currInput = filters[j].querySelector('input').value;
				if(currInput !== ''){
					activeFiltersString += `"${filters[j].querySelector('select').value}`;
					activeFiltersString += `${currInput}"`
				}
			}
			activeFiltersDiv.innerText = activeFiltersString;
		}
	}
}
/**

This function goes through the data table and ensures every row is set to active
and is being displayed on the screen, then the current row numbers and original
row numbers are designated in the associated tables

*/
function reactivateTable(){
	let tableRows = document.querySelectorAll('.datarow');
	for(let i = 0; i < tableRows.length; i++){
		tableRows[i].dataset.active = 'true';
		tableRows[i].style.display = '';
	}
	newRowNums(document.querySelector('#data'), document.querySelector('#data').children.length);
	setOriginalRowNums(document.querySelector('#data'));
}
/**

A function for going through all of the filters (div.filter) in the columnHeads and
determining which are "active" (those that have filter conditions
written in the input boxes)

@returns {array[array[div], array[numbers]]} result An array with two spots, the first of which is occupied
													by an array containing the '.filter' divs that have filter
													conditions written in their input boxes, the second spot
													has an array of the columnNumbers associated with each .filter div
													where the columnNumber found in space n of the columnNumbers array is
													the column number that the '.filter' div in space n of the activeFilters
													array is part of
*/
var testFilters = function(){
	//obtain an array of all of the filter divs in the document
	let filters = document.querySelectorAll('.filter');
	//obtain all of the statsMenus in the document
	let statsMenus = document.querySelectorAll('.statsMenu');
	let activeFilters = [];
	let columnNumbers = [];
	
	//for every filter in the document
	for(let i = 0; i < filters.length; i++){
		//obtain the input to the filter input box for this filter div
		let inputVal = filters[i].querySelector('input').value;
		
		//if the input is not blank, push the filter div onto the activeFilters array
		if(inputVal !== ''){
			activeFilters.push(filters[i]);
		}
	}
	//for every filter div that was determined to be active
	for(let i = 0; i < activeFilters.length; i++){
		//obtain the non-blank input box
		let input = activeFilters[i].querySelector('input');
		//obtain the value written in the box
		let inputVal = input.value;
		
		//check if the input box in the filter div is a filter for numbers
		if(input.classList[0] == 'numberFilter'){
			//if the filter is a number filter but the value in the input box is not a number
			if(isNaN(inputVal)){
				//alert the user that they cannot use non-numeric values in a number filter and
				//remove the character they just tried to use in their filter input
				alert('You cannot filter numbers with non-numeric values!');
				inputVal = inputVal.slice(0, inputVal.length - 1);
				activeFilters[i].querySelector('input').value = inputVal;
				
				//if removing that new character make the entire input blank
				//remove the filter from the activeFilters array because it is
				//no longer considered active
				activeFilters = activeFilters.filter(function(val){
					
					return !(val.querySelector('input').value === '')
				});
				/*
				if(inputVal === ''){
					activeFilters = activeFilters.slice(0, activeFilters.length - 1);
					continue;
				}*/
			}
		}
		//append the column number for that active filter div to the columnNumbers array
		columnNumbers[i] = 	activeFilters[i].querySelector('input').dataset.colnum;
		
	}
	//append the two result arrays to the result variable and return it
	let result = [activeFilters, columnNumbers];
	return result;
}

/**
@param {<tr>} rowNode The <tr> node in the data table which we are testing
						against every active filter

@param {array[div]} activeFilters This is an array of the filter divs which have filter text written
								in their associated <input> 

@param {array[number]} columnNumbers An array of the column numbers associated with the filters
									which are active

This function runs through all of the active filters for each rowNode passed in,
and determines if that rowNode passes all of the filter tests

*/
var test = function(rowNode, activeFilters, columnNumbers){
	//the boolean value which indicates whether the row passed all of the filter tests
	let passes = true;
	//for every active filter
	for(let i = 0; i < activeFilters.length; i++){
		
		let currentFilter = activeFilters[i];
		let inputVal = currentFilter.querySelector('input').value;
		let filterType = currentFilter.querySelector('input').classList[0];
		let datum = rowNode.childNodes[columnNumbers[i]].innerText;
		//if the filter is filtering strings
		if(filterType == 'stringFilter'){
			//obtain whether case sensitive is applicable for this filter
			let caseSensitivity = activeFilters[i].parentNode.querySelector('.caseSensitive').checked;
			if(caseSensitivity){
				//check whether there are any wildcard values
				if(inputVal.includes('#')){
					//split the filter string along the wildcard symbol and pass the resulting array
					//and the string data value we are testing against the filter
					inputVal = inputVal.split('#');
					passes = wildcardFiltering(inputVal, datum);
				}
				//if there are no wildcards, simply check if the data value in the table contains the
				//filter string
				else if(!(datum.includes(inputVal))){
					passes = false;
				}
			}
			else{
				//if the user does not check case sensitivity then we convert the filter string and 
				//the string data value to lowercase	
				if(inputVal.includes('#')){
					inputVal = inputVal.toLowerCase();
					inputVal = inputVal.split('#');
					passes = wildcardFiltering(inputVal, datum.toLowerCase());
				}
				else if(!(datum.toLowerCase().includes(inputVal.toLowerCase()))){
					passes = false;
				}
			}
		}
		//if the filter is filtering numbers
		 else {
			 //obtain the operator and operands
			let selectedOperator = currentFilter.querySelector('select').selectedOptions[0].value;
			let dataNum = parseInt(datum);
			let filterNum = parseInt(inputVal);
			//run compareNumber to determine if the data value passed the test
			let result = compareNumber(selectedOperator, dataNum, filterNum);
			if(!result){
				passes = false;
			}
			
		}
		//if the rowNode passed this filter, continue onto the next filter	
		if(passes){
			continue;
		}
		//if the rowNode did not pass this filter, remove the rowNode from display and mark it
		//as not active (meaning it wont be counted in stats or given a current row number)
		else{
			rowNode.style.display = 'none';
			rowNode.dataset.active = 'false';
			return;
		}
	}
	//if the rowNode passed all of the filters, make sure it is visible and marked as active
	rowNode.style.display = '';
	rowNode.dataset.active = 'true';
}
/**


@param {string} selectedOperator The logical operator within a numeric filter chosen by the user

@param {number} dataNum The value in the data table being compared to the filter number

@param {number} filterNum The number input into a filter which we are comparing every numeric
				value in this column against

This function uses an anonymous function as the return object, and this anonymous function
crunches the comparison of the dataNum and the filterNum...prevents the need for many if..elseif
statements				
	
@returns {Function} an anonmyous function whose execution returns the result of the comparison for	
the dataNum and the filterNum
*/
function compareNumber(selectedOperator, dataNum, filterNum){
	return Function('"use strict"; return (' + dataNum + selectedOperator + filterNum + ')')();
}	

/**
setupEventListeners()

This function is called after the tables have been built and the data
has been loaded to ensure interactivity

*/
function setUpEventListeners(){
	//everytime a row is hoevered over, the current row number is made visible
	$('.datarow').mouseover(function(){
		$('.rowNum')[$(this)[0].dataset.currentrownum - 1].innerText = $(this)[0].dataset.currentrownum;
		$('.rowNum')[$(this)[0].dataset.currentrownum - 1].style.visibility = 'visible';
		
	});
	//when the row is no longer being hoevered over, remove the visibility of the current row number
	//associated with that row
	$('.datarow').mouseout(function(){
		$('.rowNum')[$(this)[0].dataset.currentrownum - 1].style.visibility = 'hidden';
	});
	//whenever a sort option is clicked, call the sort function
	$('.sortOption').click(sort);
	//whenever a filter div receives some form of user input, filter the table
	$('.filter').on('input', filter);
	//when a user hovers over a column head, display the statsMenu associated with that column
	//when the user moves off of the column head, remove the statsMenu from display
	$('.columnHead').hover(function(event){
		let colnum = event.target.parentNode.dataset.colnum;
		$(`#statsContainer > div[data-colnum=${colnum}]`)[0].style.display = 'block';
		event.target.innerText += `:${event.target.parentNode.dataset.type}`;
	}, function(event){
		let colnum = event.target.parentNode.dataset.colnum;
		$(`#statsContainer > div[data-colnum=${colnum}]`)[0].style.display = 'none';
		event.target.innerText = event.target.innerText.slice(0, -7);
	});
	//if we change the case sensitivity of a filter, refilter the data
	$('.caseSensitive').on('change', filter);
	//if we click to add or remove a filter, perform the associated function
	$('.filterAdd').click(addNewFilter);
	$('.filterRemove').click(removeFilter);
}
/**


@param {<table>} table The data table
@param {number }num The number of rows of data in the data table

newRowNums cycles through the 'active' rows in the table 
and sets the data-currentrownum of each <tr> element
 
*/
function newRowNums(table, num){
	let j = 1;
	for(let i = 1; i < num; i++){
		rowNode = table.childNodes[i];
		if(rowNode.dataset.active === 'true'){
			rowNode.dataset.currentrownum = j;
			j++;
		}
	}
}
/**

@param {<table>} The data table

This function loops through the table and for every active row, the original
row number is placed in the originalRowNumTable
For all of the rows which are not active, the original row num is removed from display

*/
function setOriginalRowNums(table){
	let originalRowNumTable = document.querySelector('#tableOfOriginalRowNum').childNodes[0];
	let j = 0;
	for(let i = 1; i < table.children.length; i++){
		if(table.childNodes[i].dataset.active === 'true'){
			originalRowNumTable.childNodes[j].innerText = table.childNodes[i].dataset.originalrownum;
			j++;
		}
	}
	for(let k = j; k < originalRowNumTable.children.length; k++ ){
		originalRowNumTable.childNodes[k].innerText = '';
	}
}
/**

@param {array[string]} inputVal An array containing every part of a string separated
								by the location of wildcards in the original filter input
								string
@param {string} datum The string data value we are testing against the wildcard filter value 

This function goes through the array of the pieces of the original filter string and checks that
every two pieces are present in the data string...if they are both present, a check is made to ensure
that the piece of the string that came later in the wildcard filtering actually comes after the piece
that came earlier in the wildcard filtering

ex)

datum --> Jerrold Windman

inputVal --> [j,rr] (came from j#rr)

Check that j and rr are both part of the string,
then check that rr comes at a later index than j

@returns {boolean} Whether or not the data string passed the filter test
*/
function wildcardFiltering(inputVal, datum){
	for(let i = 0, j = 1; j < inputVal.length; i++, j++){
		if(datum.includes(inputVal[i]) && datum.includes(inputVal[j]) 
			&& (datum.indexOf(inputVal[i])+inputVal[i].length) < datum.indexOf(inputVal[j])+1){
				
		}
		else{
			return false;
		}
	}
	return true;
}

/**
@param {eventObject} event The event object representing the click on the add button for a new filter
							in a filterMenu
							
This function creates a new filter div and adds it to the activeFilters div of a filterMenu in a menu node
*/
function addNewFilter(event){
	let clickedAdd = event.target;
	let columnNumber = event.target.parentNode.previousElementSibling.children[0].children[0].dataset.colnum;
	let activeFiltersDiv = event.target.parentElement.previousElementSibling;
	let filterType = activeFiltersDiv.childNodes[1].querySelectorAll('input')[0].className;
	let newFilter = document.createElement('div');
	
	newFilter.setAttribute('class', 'filter');
	newFilter.setAttribute('data-colnum', columnNumber);
	
	//add eventListener for this new filter
	$(newFilter).on('input', filter);
	
	if(filterType == 'stringFilter'){
		let newInputBox = document.createElement('input');
		newInputBox.setAttribute('class', 'stringFilter');
		newInputBox.setAttribute('data-colnum', columnNumber);
		newFilter.appendChild(newInputBox);
		//insert the new input box between the existing filter box(es) and the case sensitive checkbox
		activeFiltersDiv.insertBefore(newFilter, activeFiltersDiv.querySelector('.caseSensitive'));
	}else {
		let numberFilter = document.querySelector('#numberFilter');
		
		//grab a template for a numberFilter, clone it and unwrap it
		let newNumberFilterFragment = document.importNode(numberFilter.content, true);
		let newNumberFilterSelect = newNumberFilterFragment.childNodes[1];
		let newNumberFilterInput = newNumberFilterFragment.childNodes[3];
		
		newNumberFilterInput.setAttribute('data-colnum', columnNumber);
		
		//append the components to the filter div and append te div to the activeFiltersDiv
		newFilter.appendChild(newNumberFilterSelect);
		newFilter.appendChild(newNumberFilterInput);
		activeFiltersDiv.appendChild(newFilter);
	}
}
/**
@param {eventObject} The event object representing the click on the remove button for a new filter
							in a filterMenu
							
This function removes a newly added filter from a filter menu but will never leave a filter menu
with less than 1 filter

After removing a filter, the filter() function is called to refilter based on the filter conditions still in place

*/
function removeFilter(event){
	let clickedAdd = event.target;
	let activeFiltersDiv = event.target.parentElement.previousElementSibling;
	let numberOfFilters = activeFiltersDiv.querySelectorAll('.filter').length;
	if(numberOfFilters > 1){
		activeFiltersDiv.removeChild(activeFiltersDiv.querySelectorAll('.filter')[numberOfFilters - 1]);
	}
	filter();
}
/**
A function for calculating stats for a number column and placing them in the statsMenu associated with 
that column
*/
function generateNumericalStats(){
	let stats = document.querySelectorAll('.numStatsMenu');
	
	for(let i = 0; i < stats.length; i++){
		let activeRows = document.querySelectorAll(`tr[data-active=${true}]`);
		let colnum = stats[i].dataset.colnum;
		let resultSet = gatherAndSum(activeRows, colnum);
		numberSet = resultSet[0];
		let count = numberSet.length;
		let sum = resultSet[1];
		let mean = sum/count;
		let range = numberSet[numberSet.length - 1] - numberSet[0];
		let median = numberSet[Math.floor(count/2)];
		
		stats[i].querySelector('.count').innerText = `Count: ${count}`;
		stats[i].querySelector('.sum').innerText = `Sum: ${sum}`;
		stats[i].querySelector('.mean').innerText = `Mean: ${mean}`;
		stats[i].querySelector('.range').innerText = `Range: ${range}`;
		stats[i].querySelector('.median').innerText = `Median: ${median}`;
		
	}
}
/**
A function for calculating stats for a string column and placing them in the statsMenu associated with 
that column
*/
function generateStringStats(){
	let stats = document.querySelectorAll('.stringStatsMenu');
	
	for(let i = 0; i < stats.length; i++){
		let activeRows = document.querySelectorAll(`tr[data-active=${true}`);
		let colnum = stats[i].dataset.colnum;
		let resultSet = gather(activeRows, colnum);
		let count = resultSet[1].length;
		let firstNonAlpha = resultSet[0][0];
		let lastNonAlpha = resultSet[0][1];
		let firstAlpha = resultSet[0][2];
		let lastAlpha = resultSet[0][3];
		
		stats[i].querySelector('.count').innerText = `Count: ${count}`;
		stats[i].querySelector('.first').innerText = `First: ${firstNonAlpha}`;
		stats[i].querySelector('.last').innerText = `Last: ${lastNonAlpha}`;
		stats[i].querySelector('.firstAZ').innerText = `First (A-Z): ${firstAlpha}`;
		stats[i].querySelector('.lastAZ').innerText = `Last (A-Z): ${lastAlpha}`;
		
		
	}
}
/**
@param {array[<tr>]} activeRows An array of the rows in the table which currently
								have their data-active attribute set to 'true'

@param {number} colnum The column number whose data we want to gather from the active rows

This function is used when gathering numerical data to be used in the generateNumericalStats to
obtain only the data points in an associated column number which are part of rows considered active

@returns array[array[number], number] A nameless array which contains the set of data contained
											in the column designated by colnum in the rows listed in
											activeRows, and a number representing the sum of the data contained
											in the dataSet
								
*/
function gatherAndSum(activeRows, colnum){
	let dataSet = [];
	let sum = 0;
	for(let i = 0; i < activeRows.length; i++){
		dataSet[i] = parseInt(activeRows[i].children[colnum].innerText);
		sum += parseInt(dataSet[i]);
	}
	return [dataSet, sum];
}
/**
@param {array[<tr>]} activeRows An array of the rows in the table which currently
								have their data-active attribute set to 'true'

@param {number} colnum The column number whose data we want to gather from the active rows

This function is used when gathering string data to be used in the generateStringStats to
obtain only the data points in an associated column number which are part of rows considered active

@returns array[array[string], array[string]] A nameless array which contains in its first spot an array of strings called
											resultSet which contains four strings of importance when examining a column of string
											data and in the second port of the array is the entire active dataSet of strings in the
											associated column
								
*/
function gather(activeRows, colnum){
	let dataSet = [];
	let resultSet = [];
	for(let i = 0; i < activeRows.length; i++){
		dataSet[i] = activeRows[i].children[colnum].innerText;
	}
	resultSet[0] = dataSet[0];
	resultSet[1] = dataSet[dataSet.length - 1];
	
	dataSet = dataSet.sort(function(a, b) {
			let x = a.toLowerCase();
            let y = b.toLowerCase();
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
    });

	resultSet[2] = dataSet[0];
	resultSet[3] = dataSet[dataSet.length - 1];
	return [resultSet, dataSet];
}

