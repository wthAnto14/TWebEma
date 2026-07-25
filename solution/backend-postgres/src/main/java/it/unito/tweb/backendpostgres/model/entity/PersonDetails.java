package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "person_details")
public class PersonDetails {

    @Id
    @Column(name = "person_mal_id")
    private Integer personMalId;

    @Column(name = "url")
    private String url;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "name")
    private String name;

    @Column(name = "given_name")
    private String givenName;

    @Column(name = "family_name")
    private String familyName;

    @Column(name = "birthday")
    private String birthday;

    @Column(name = "favorites")
    private String favorites;

    @Column(name = "relevant_location")
    private String relevantLocation;

    public Integer getPersonMalId() { return personMalId; }
    public String getName() { return name; }
    public String getGivenName() { return givenName; }
    public String getFamilyName() { return familyName; }
    public String getBirthday() { return birthday; }
    public String getWebsiteUrl() { return websiteUrl; }
    public String getImageUrl() { return imageUrl; }
    public String getFavorites() { return favorites; }
    public String getRelevantLocation() { return relevantLocation; }

}
