- Add barcoded samples to the database
    - Linked to study information (year, site, contact person, sample type (DNA, serum, mosquito, etc))
    - Option to have more than 1 DNA sample with the same name, differentiated as spot 1, spot 2 etc.
        - Notes associated with sample, "second spot extracted"
            - Need to think about a good way to do this, what terminology can we use to differentiate different sample types? Different sample types have different characteristics that we could potentially describe, e.g. bloodspots have different numbers of spots which we could keep track of.
    - Where sample is located

- Flag DNA Samples as exhausted

- Search for location of DNA samples
    - Flag exhausted samples
    - Show when second sample is available

- Way to verify that newly organized samples are the samples you wanted. Just verify that your new plate has the samples in the location where you said you wanted them.

- Option to search for a single sample by typing in id and date info directly

- Option to update location of samples after plates have been scanned. Can you do this by scanning the new plate and not having to scan all the plates from which samples had been taken? (yes)

- Dates should read DD-MMM-YYYY to avoid ambiguity --> stored in db as DateTime value, this is purely a presentation and data parsing detail.

- Automated backups --> daily when used?
