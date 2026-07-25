package it.unito.tweb.backendpostgres.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "person_voice_works")
@IdClass(PersonVoiceWorksId.class)
public class PersonVoiceWorks {

    @Id
    @Column(name = "person_mal_id")
    private Integer personMalId;

    @Id
    @Column(name = "anime_mal_id")
    private Integer animeMalId;

    @Id
    @Column(name = "character_mal_id")
    private Integer characterMalId;

    @Id
    @Column(name = "role")
    private String role;

    @Column(name = "language")
    private String language;

    public Integer getPersonMalId() { return personMalId; }
    public Integer getAnimeMalId() { return animeMalId; }
    public Integer getCharacterMalId() { return characterMalId; }
    public String getRole() { return role; }
    public String getLanguage() { return language; }
}
