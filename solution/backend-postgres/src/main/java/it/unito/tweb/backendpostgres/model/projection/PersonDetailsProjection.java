package it.unito.tweb.backendpostgres.model.projection;

public interface PersonDetailsProjection {
    Integer getPersonMalId();
    String getUrl();
    String getWebsiteUrl();
    String getImageUrl();
    String getName();
    String getGivenName();
    String getFamilyName();
    String getBirthday();
    String getFavorites();
    String getRelevantLocation();
}