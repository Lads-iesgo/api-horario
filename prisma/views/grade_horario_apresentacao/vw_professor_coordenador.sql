SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `pc`.`isCoordenador` AS `isCoordenador`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `grade_horario_apresentacao`.`professor` `p`
      JOIN `grade_horario_apresentacao`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )
WHERE
  (`pc`.`isCoordenador` = 1)