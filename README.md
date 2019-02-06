# csvParser

The system is intended for sorting and filtering large datasets contained within CSV files. Trying to parse files with other extensions
may result in unknown and potentially catastrophic consequences.

A set of sample data called MOCK_DATA.csv is provided in the repository.

When the data is loaded, hovering over any of the column names will show the user what datatype is located in that column, 
a menu for sorting and filtering, as well as a readout of several stats regarding the column being hovered over.

Next to every row the user will see an index number which represents the original row number, that is, the order that the associated data row
originally was in the CSV file. When a row is hovered over, a second number will be displayed, and this represents the data row number
in the current display.

The sorting options for string data includes sorting from A-Z and fom Z-A, and the sorting for number data includes sorting from Low to
High and from High to Low.

Numerical data can be filtered based on basic equality operators, for example "< 300", ">= 200" and "=1000".

String data can be filtered using both uppercase and lowercase letters (optional case sensitivity), as well as filtered using a '#' as 
a wildcard character. The wildcard is capable of representing 0 to many letters separating other letters.

For example,

"Jerrold Windman" can be filtered out using combinations like:

"j#rr", "o#d", #j#d, "e#ol#d" and many others.

Hovering over the filter option in any column name's menu will display the filter menu for the associated column.
Multiple filters can be added to any column using the Add button, and then subsequently removed using the Remove button. 

The currently applied filters can also be seen in the banner along the top of the browser when a column name is hovered over. 
Along with this, several stats of potential interest are available to the user in this banner. For both string and numerical data, the
count will be displayed. 

For string data, the user can also see the first and last (in terms of their current placement in the data table) entry 
in the column being hovered over, as well as the first and last entry (alphabetically) in the column being hovered over.

For numerical data, users can also see information like mean, median, and range.

If at any point the user wants to switch to view a different CSV file, they simply need to select a new file and the
system will clear all of the old data and display the data of the new file.
