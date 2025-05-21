<!DOCTYPE html>
<html lang="nl" xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verlof Aanvragen</title>
</head>
<body class="verlof-modal-body"> <!-- Added class for scoping -->
    <!-- Removed app-header as it's not needed in modal -->
    <div class="form-container">
        <form id="verlof-form" class="verlof-form" novalidate>
            <div class="form-header">
                <h2 class="form-title">Verlofaanvraag Indienen</h2>
                <!-- Removed back-link as it's not relevant in modal -->
            </div>

            <!-- Notification area for form messages -->
            <div id="modal-notification-area"></div>

            <div class="form-row">
                <div class="form-group">
                    <label for="MedewerkerDisplay" class="form-label">Medewerker</label>
                    <input type="text" id="MedewerkerDisplay" name="MedewerkerDisplay" class="form-input" readonly title="Uw naam zoals bekend in het systeem.">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="StartDatePicker" class="form-label required">Startdatum</label>
                    <input type="date" id="StartDatePicker" name="StartDatePicker" class="form-input" required title="Selecteer de startdatum van uw verlof.">
                </div>
                <div class="form-group">
                    <label for="StartTimePicker" class="form-label required">Starttijd</label>
                    <input type="time" id="StartTimePicker" name="StartTimePicker" class="form-input" value="09:00" required title="Selecteer de starttijd van uw verlof.">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="EndDatePicker" class="form-label required">Einddatum</label>
                    <input type="date" id="EndDatePicker" name="EndDatePicker" class="form-input" required title="Selecteer de einddatum van uw verlof.">
                </div>
                <div class="form-group">
                    <label for="EndTimePicker" class="form-label required">Eindtijd</label>
                    <input type="time" id="EndTimePicker" name="EndTimePicker" class="form-input" value="17:00" required title="Selecteer de eindtijd van uw verlof.">
                </div>
            </div>

            <div class="form-group">
                <label for="Reden" class="form-label required">Verlofreden</label>
                <select id="Reden" name="Reden" class="form-select" required title="Kies de reden voor uw verlofaanvraag.">
                    <option value="">-- Kies een reden --</option>
                    </select>
            </div>

            <div class="form-group">
                <label for="Omschrijving" class="form-label">Omschrijving (optioneel)</label>
                <textarea id="Omschrijving" name="Omschrijving" class="form-textarea" placeholder="Eventuele toelichting, bijv. specifieke details over gedeeltelijke dag." title="Geef hier eventueel een extra toelichting op uw verlofaanvraag."></textarea>
            </div>

            <div class="form-actions">
                <a href="../verlofRooster.aspx" class="btn btn-secondary">Annuleren</a>
                <button type="submit" id="submit-button" class="btn btn-primary">Verstuur Aanvraag</button>
            </div>
        </form>
    </div>
    <!-- <script src="../js/ui_utilities.js"></script> --> <!-- Not needed if functions are globally available or passed -->
    <!-- <script src="js/meldingVerlof_logic.js"></script> --> <!-- Logic will be called from parent modal script -->
</body>
</html>