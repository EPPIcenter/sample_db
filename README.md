# Getting Started
Before samples may be added to the database, **Locations** and **Specimen Types** must be registered.

## Locations
Locations are short, unique descriptions to indicate to the user where a sample is stored and are used when plates are updated or added to the database. This is useful in the case that there may be multiple freezers where samples are stored. To register a new location, go to the locations tab, press **Add New Location**, write a short, unique description, and press submit. All currently registered locations will be listed under the **Locations** tab.

## Specimen Types
Specimen Types are short, unique descriptions of the type of specimen that is contained in the matrix tube. This allows for multiple work flows to be delineated and associated with samples. For example, a specimen type may be **DNA (DBS)** indicating that it is DNA extracted from Dried Blood Spots, while another specimen type could be **DNA (WB)**, indicating that it is DNA extracted from Whole Blood. To add a new specimen type, go to the specimen type tab, press **Add New Specimen Type**, write a short, unique description, and press submit. All currently registered specimen types will be listed under the **Specimen Types** tab.

# Studies
Studies are the primary organizational structure in the SampleDB. Studies allow for sample IDs that are not unique globally, but are unique within a study.
## Add New Study
Every sample must be associated with a study. To add a new study, select the **Study** tab and press **Add New Study**, fill out the indicated fields, and press submit

|Field|Value|
|-|-|
|Title (required)| A general description of the study.
|Description (optional)| A space for more description if desired.
|Short Code (required)| A short, unique sequence to identify the study when uploading samples.
|Lead Person (required)| The individual responsible for samples in the study.
|Longitudinal (required)| Indicate whether or not the study is longitudinal. If so, samples must be registered with a collection date.

## Delete Study
Studies may only be deleted if they do not have any samples associated.

# Plates
Plates indicate the physical location of samples. All plates are listed under the plate tab and may be selected to view their contents. Plates may be hidden from view by selecting and toggling the view button. Hidden plates may viewed by selecting the **Toggle Hidden Plates** button on the plate tab.

## Add New Plate
To add a new plate, navigate to the plates tab and press **Add New Plate** and fill in the required fields. If registering an empty plate without tubes, only **Location** and **Plate UID** are required.

|Field|Value|
|-|-|
|Location (required)| The physical location the plate is stored. Locations are registered under the location tab.|
|Plate UID (required)| A short, unique alpha-numeric ID to identify the plate.
|Create Missing Subjects| Toggle true if adding new subjects to the database. Toggle false otherwise to act as a sanity check against incorrectly registering samples due to typos.
|Create Missing Specimens| Toggle true if adding new specimens ( a new specimen type, or a new collection date) to the database and not just new aliquots. Toggle false if all specimens being added are new aliquots of specimens that already exist.
|File Field| CSV file containing the locations, tube barcodes, and sample information for specimens that are to be registered. Templates to [Upload (with date)](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/plate_upload_template_with_date.csv) and [Upload (without date)](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/plate_upload_template_without_date.csv) are linked respectively. Date format is `DD/MM/YYYY`.

## Update Tube Locations
In order to update the locations of tubes in the database, the database must know the location of every tube that has moved. For example, if tubes are swapped between two registered plates, both plates must be updated simultaneously to ensure integrity of the plates and database. Otherwise the database will throw an error. To update the locations of tubes, select the **Plate** tab and press **Update Plate**. Press **choose files**, and select all files that are updating tube locations. The template for updating plates may be found [here.](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/plate_update_template.csv) **The filename for each file must be the UID of the plate that is being updated.**

## Delete Plate
Plates may only be deleted if they are empty.

# Search
Searching for samples may be done manually by selecting a study, then selecting a study subject and looking at the linked specimens, or by selecting a plate, and looking at each tube within the plate. Bulk searches may be conducted by selecting the **Search** tab, where barcodes may be converted to sample information, or samples may be searched for to find their physical location.

## Search by Barcode
Arbitrary CSV files containing a field labeled **Barcode** may be used. SampleDB will output a CSV file containing all uploaded data, with the barcode field removed and replaced by specimen information.

## Search By Specimen
A CSV file [(template here)](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/specimen_search_template.csv) containing unique specimen identifying information may be used to find the physical location of samples. SampleDB will export a csv file indicating the Plate UID and Well Location of each sample, and indicate if a sample could not be found.

# Delete Entries
In the case that tubes or specimens must be deleted from the database, navigate to the **Delete** tab, and upload the indicated files ([Delete by Specimen Template](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/delete_specimen_template.csv) or [Delete by Barcode Template](https://github.com/Greenhouse-Lab/sample_db/blob/master/templates/delete_barcode_template.csv)). Succesful deletion will result in a message with the number of specimens and tubes that have been deleted from the database.

# Backup and Restore Databases
SampleDB will automatically backup the database the first time that it is run every day. Backups are stored at the following locations

|Platform |Path |
|-|-|
|Windows:|`C:\\User\yourUserName\Local\com.greenhouse.sampledb\{current_version}\db_backups`|
|Mac:|`~/Library/Application Support/com.greenhouse.sampledb/{current_version}/db_backups` |

Backups may be restored by overwriting the sample_db.sqlite file contained in the application data folder.

 **Be sure to close SampleDB after use, otherwise the database will not be backed up daily**