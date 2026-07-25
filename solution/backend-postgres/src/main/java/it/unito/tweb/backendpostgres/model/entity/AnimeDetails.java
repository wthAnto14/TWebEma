package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "anime_details")
public class AnimeDetails {

    @Id
    @Column(name = "mal_id")
    private Integer malId;

    private String title;

    @Column(name = "title_japanese")
    private String titleJapanese;

    private String url;

    @Column(name = "image_url")
    private String imageUrl;

    private String type;
    private String status;
    private Double score;

    @Column(name = "start_date")
    private java.sql.Timestamp startDate;

    @Column(name = "end_date")
    private java.sql.Timestamp endDate;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    // GETTER

    public Integer getMalId() { return malId; }

    public String getTitle() { return title; }

    public String getTitleJapanese() { return titleJapanese; }

    public String getUrl() { return url; }

    public String getImageUrl() { return imageUrl; }

    public String getType() { return type; }

    public String getStatus() { return status; }

    public Double getScore() { return score; }

    public java.sql.Timestamp getStartDate() { return startDate; }

    public java.sql.Timestamp getEndDate() { return endDate; }

    public String getSynopsis() { return synopsis; }
}
