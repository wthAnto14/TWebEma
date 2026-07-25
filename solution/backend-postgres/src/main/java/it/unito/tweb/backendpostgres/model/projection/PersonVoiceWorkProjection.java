package it.unito.tweb.backendpostgres.model.projection;

public interface PersonVoiceWorkProjection {
    Integer getAnimeMalId();
    String getAnimeTitle();
    Integer getCharacterMalId();
    String getCharacterName();
    String getRole();
    String getLanguage();
}
