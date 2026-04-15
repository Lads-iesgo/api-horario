SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `nomeDisciplina`
FROM
  (
    (
      `grade_horario_apresentacao`.`professor` `p`
      JOIN `grade_horario_apresentacao`.`disciplina_professor` `dp` ON((`p`.`idProfessor` = `dp`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`disciplina` `d` ON((`dp`.`idDisciplina` = `d`.`idDisciplina`))
  )