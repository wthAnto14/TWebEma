package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "characters")
public class CharacterDetails {

    @Id
    @Column(name = "character_mal_id") // Chiave primaria vista nell'immagine
    private Integer malId;

    @Column(name = "name")
    private String name;

    @Column(name = "image") // Nell'immagine la colonna si chiama 'image', non 'image_url'
    private String imageUrl;

    @Column(name = "url") // Opzionale, se serve il link a MAL
    private String url;

    // Getters e Setters standard
    public Integer getMalId() { return malId; }
    public void setMalId(Integer malId) { this.malId = malId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
