SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`codigoCurso` AS `codigoCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `grade_horario_apresentacao`.`professor` `p`
      JOIN `grade_horario_apresentacao`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )
UNION
ALL
SELECT
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`codigoCurso` AS `codigoCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    `grade_horario_apresentacao`.`professor` `p`
    JOIN `grade_horario_apresentacao`.`curso` `c`
  )
WHERE
  (`p`.`idProfessor` IN (1, 2))
ORDER BY
  `nomeCurso`,
  `nomeProfessor`