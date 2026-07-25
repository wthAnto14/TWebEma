package it.unito.tweb.backendpostgres.model.projection;

public interface AnimeListItem {
    Integer getMalId();
    String getTitle();
    String getTitleJapanese();
    String getImageUrl();
    String getType();
    Double getScore();
}
